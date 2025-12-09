// src/utils/canvasHelpers.js

const CONFIG = window.CONFIG || {};
const rgbaString = window.rgbaString || ((c, a = 1) => `rgba(${c.r},${c.g},${c.b},${a})`);

/**
 * Calculate layout with zoom + pan
 */
const calculateCanvasLayout = (canvas, mapImage, zoom, panOffset) => {
  const scale = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height) * zoom;
  const scaledWidth = mapImage.width * scale;
  const scaledHeight = mapImage.height * scale;
  const offsetX = (canvas.width - scaledWidth) / 2 + panOffset.x;
  const offsetY = (canvas.height - scaledHeight) / 2 + panOffset.y;

  return { scale, scaledWidth, scaledHeight, offsetX, offsetY };
};

/**
 * Draw crisp background + map
 */
const drawClearMap = (ctx, canvas, mapImage, layout) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = CONFIG.CANVAS?.BACKGROUND_COLOR || '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mapImage, layout.offsetX, layout.offsetY, layout.scaledWidth, layout.scaledHeight);
};

/**
 * TRUE circular reveal – no more rectangles, ever
 */
const drawVisionCircle = (ctx, x, y, radius, isCurrent = false) => {
  // Save the current state (we're going to clip)
  ctx.save();

  // Create perfect circular clipping path
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();                          // ← This is the magic

  // Now draw a gradient that goes from fully transparent (center) to black (edge)
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  if (isCurrent) {
    // Current torch / reveal = bright center
    gradient.addColorStop(0.0, 'rgba(0,0,0,1)');    // full removal in center
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.2)');
    gradient.addColorStop(1.0, 'rgba(0,0,0,0)');    // soft edge
  } else {
    // Past explored memory = dimmer
    gradient.addColorStop(0.0, 'rgba(0,0,0,0.7)');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1.0, 'rgba(0,0,0,0)');
  }

  ctx.fillStyle = gradient;
  // Fill a giant square – the clip() above guarantees only lets the circle through
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  ctx.restore(); // remove the clip for future drawing
};

/**
 * UPGRADED: Best-in-class fog of war with torch memory
 */
const drawFogOfWar = (
  blurCtx,
  canvas,
  mapImage,
  layout,
  exploredAreas,
  tokenPos,
  revealRadiusPercent,
  gmTorchlight,
  gmMode
) => {
  blurCtx.clearRect(0, 0, canvas.width, canvas.height);
  blurCtx.fillStyle = CONFIG.CANVAS?.BACKGROUND_COLOR || '#000';
  blurCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw blurred map
  blurCtx.filter = `blur(${CONFIG.CANVAS?.BLUR_AMOUNT || 12}px)`;
  blurCtx.drawImage(mapImage, layout.offsetX, layout.offsetY, layout.scaledWidth, layout.scaledHeight);
  blurCtx.filter = 'none';

  // Full darkness in torch mode
  if (gmTorchlight && !gmMode) {
    blurCtx.fillStyle = 'rgba(0,0,0,0.85)';
    blurCtx.fillRect(0, 0, canvas.width, canvas.height);
  }

  blurCtx.globalCompositeOperation = 'destination-out';

  const radius = (revealRadiusPercent / 100) * layout.scaledWidth;

  if (gmTorchlight && !gmMode) {
    // === TORCHLIGHT MODE ===
    // 1. Draw all past explored areas (dim)
    exploredAreas.forEach(area => {
      const ex = layout.offsetX + area.x * layout.scaledWidth;
      const ey = layout.offsetY + area.y * layout.scaledHeight;
      drawVisionCircle(blurCtx, ex, ey, radius, false);
    });

    // 2. Draw current token position (bright!)
    const tx = layout.offsetX + tokenPos.x * layout.scaledWidth;
    const ty = layout.offsetY + tokenPos.y * layout.scaledHeight;
    drawVisionCircle(blurCtx, tx, ty, radius, true);

  } else if (!gmMode) {
    // === NORMAL FOG MODE ===
    exploredAreas.forEach(area => {
      const x = layout.offsetX + area.x * layout.scaledWidth;
      const y = layout.offsetY + area.y * layout.scaledHeight;
      drawVisionCircle(blurCtx, x, y, radius, true);
    });
  }

  blurCtx.globalCompositeOperation = 'source-over';
};

/**
 * Crisp token with glowing halo (only when needed)
 */
const drawToken = (ctx, tokenPos, layout, revealRadiusPercent, gmMode, gmTorchlight) => {
  const x = layout.offsetX + tokenPos.x * layout.scaledWidth;
  const y = layout.offsetY + tokenPos.y * layout.scaledHeight;
  const baseRadius = CONFIG.TOKEN?.RADIUS || 20;

  // Halo UNDER token (warm glow, no overlay on token itself)
  if (gmMode || gmTorchlight) {
    const haloRadius = (revealRadiusPercent / 100) * layout.scaledWidth * 1.2;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
    const haloColor = gmTorchlight 
      ? { r: 255, g: 180, b: 50 }  // Warmer torch orange-gold
      : { r: 100, g: 180, b: 255 }; // GM blue

    grad.addColorStop(0, rgbaString(haloColor, 0.7));
    grad.addColorStop(0.5, rgbaString(haloColor, 0.2));
    grad.addColorStop(1, rgbaString(haloColor, 0));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, haloRadius, 0, Math.PI * 2);  // Circle clip for halo too
    ctx.fill();
  }

  // Token body — no shadow (removes muddiness)
  ctx.fillStyle = CONFIG.COLORS?.TOKEN_FILL || '#ffd700';
  ctx.beginPath();
  ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bright stroke — white in torch mode for max contrast on black
  ctx.strokeStyle = CONFIG.COLORS?.TOKEN_STROKE || '#b8860b';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (gmTorchlight && !gmMode) {
    ctx.strokeStyle = '#ffffa0';        // soft warm gold, same family as GM halo
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Highlight speck
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x - 6, y - 6, baseRadius * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

/**
 * HiDPI-aware canvas resize (CRITICAL for mobile!)
 */
const setupHiDPICanvas = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Only resize if display size changed
  if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.getContext('2d').scale(dpr, dpr);
    return true;
  }
  return false;
};

// Global assignment
if (typeof window !== 'undefined') {
  Object.assign(window, {
    calculateCanvasLayout,
    drawClearMap,
    drawVisionCircle,
    drawFogOfWar,
    drawToken,
    setupHiDPICanvas, // ← use this instead of resizeCanvas
  });
}

export {
  calculateCanvasLayout,
  drawClearMap,
  drawVisionCircle,
  drawFogOfWar,
  drawToken,
  setupHiDPICanvas,
};