// src/utils/canvasHelpers.js

// Import from config (will use window.CONFIG if not available as module)
const CONFIG = window.CONFIG || {};
const rgbaString = window.rgbaString || ((color, alpha = 1) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);

/**
 * Calculate canvas layout dimensions based on map image, zoom, and pan
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
 * Draw the clear map (no fog) on the canvas
 */
const drawClearMap = (ctx, canvas, mapImage, layout) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mapImage, layout.offsetX, layout.offsetY, layout.scaledWidth, layout.scaledHeight);
};

/**
 * Draw a vision circle (used for fog of war reveals)
 */
const drawVisionCircle = (ctx, x, y, radius) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(
    CONFIG.VISION.GRADIENT_INNER_STOP, 
    `rgba(255, 255, 255, ${CONFIG.VISION.GRADIENT_INNER_ALPHA})`
  );
  gradient.addColorStop(
    CONFIG.VISION.GRADIENT_MID_STOP, 
    `rgba(255, 255, 255, ${CONFIG.VISION.GRADIENT_MID_ALPHA})`
  );
  gradient.addColorStop(
    CONFIG.VISION.GRADIENT_OUTER_STOP, 
    `rgba(255, 255, 255, ${CONFIG.VISION.GRADIENT_OUTER_ALPHA})`
  );
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Draw fog of war overlay (blurred map with vision reveals)
 */
const drawFogOfWar = (
  blurCtx, 
  canvas, 
  mapImage, 
  layout, 
  exploredAreas, 
  tokenPos, 
  revealRadiusPercent, 
  gmTorchlight
) => {
  blurCtx.clearRect(0, 0, canvas.width, canvas.height);
  blurCtx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
  blurCtx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply blur to map
  blurCtx.filter = `blur(${CONFIG.CANVAS.BLUR_AMOUNT}px)`;
  blurCtx.drawImage(mapImage, layout.offsetX, layout.offsetY, layout.scaledWidth, layout.scaledHeight);
  blurCtx.filter = 'none';

  // Darken if torchlight mode
  if (gmTorchlight) {
    blurCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.CANVAS.DARKNESS_OPACITY})`;
    blurCtx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Cut out vision circles
  blurCtx.globalCompositeOperation = 'destination-out';
  
  const visionRadiusInMapUnits = revealRadiusPercent / 100;
  const radius = visionRadiusInMapUnits * layout.scaledWidth;
  
  if (gmTorchlight) {
    // Torchlight mode: only reveal current position
    const x = layout.offsetX + tokenPos.x * layout.scaledWidth;
    const y = layout.offsetY + tokenPos.y * layout.scaledHeight;
    drawVisionCircle(blurCtx, x, y, radius);
  } else {
    // Normal mode: reveal all explored areas
    exploredAreas.forEach(area => {
      const x = layout.offsetX + area.x * layout.scaledWidth;
      const y = layout.offsetY + area.y * layout.scaledHeight;
      drawVisionCircle(blurCtx, x, y, radius);
    });
  }

  blurCtx.globalCompositeOperation = 'source-over';
};

/**
 * Draw the player token with shadow, highlight, and optional halo
 */
const drawToken = (ctx, tokenPos, layout, revealRadiusPercent, gmMode, gmTorchlight) => {
  const tokenX = layout.offsetX + tokenPos.x * layout.scaledWidth;
  const tokenY = layout.offsetY + tokenPos.y * layout.scaledHeight;
  
  // Draw halo first (behind token)
  if (gmMode || gmTorchlight) {
    const haloRadius = (revealRadiusPercent / 100) * layout.scaledWidth;
    const gradient = ctx.createRadialGradient(tokenX, tokenY, 0, tokenX, tokenY, haloRadius);
    
    if (gmTorchlight) {
      gradient.addColorStop(0, rgbaString(CONFIG.COLORS.TORCH_HALO, 0.75));
      gradient.addColorStop(1, rgbaString(CONFIG.COLORS.TORCH_HALO_OUTER, 0.25));
    } else if (gmMode) {
      gradient.addColorStop(0, rgbaString(CONFIG.COLORS.GM_HALO, 0.75));
      gradient.addColorStop(1, rgbaString(CONFIG.COLORS.GM_HALO, 0.25));
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(tokenX, tokenY, haloRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Shadow
  ctx.fillStyle = CONFIG.COLORS.TOKEN_SHADOW;
  ctx.beginPath();
  ctx.arc(
    tokenX + CONFIG.TOKEN.SHADOW_OFFSET, 
    tokenY + CONFIG.TOKEN.SHADOW_OFFSET, 
    CONFIG.TOKEN.RADIUS, 
    0, 
    Math.PI * 2
  );
  ctx.fill();
  
  // Token body
  ctx.fillStyle = CONFIG.COLORS.TOKEN_FILL;
  ctx.strokeStyle = CONFIG.COLORS.TOKEN_STROKE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(tokenX, tokenY, CONFIG.TOKEN.RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Highlight
  ctx.fillStyle = CONFIG.COLORS.TOKEN_HIGHLIGHT;
  ctx.beginPath();
  ctx.arc(
    tokenX - CONFIG.TOKEN.HIGHLIGHT_OFFSET, 
    tokenY - CONFIG.TOKEN.HIGHLIGHT_OFFSET, 
    CONFIG.TOKEN.HIGHLIGHT_RADIUS, 
    0, 
    Math.PI * 2
  );
  ctx.fill();
};

/**
 * Resize canvas to match its display size (for sharp rendering)
 */
const resizeCanvas = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const needsResize = canvas.width !== rect.width || canvas.height !== rect.height;
  
  if (needsResize) {
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  return needsResize;
};

// Make available globally for now (for standalone HTML)
if (typeof window !== 'undefined') {
  window.calculateCanvasLayout = calculateCanvasLayout;
  window.drawClearMap = drawClearMap;
  window.drawVisionCircle = drawVisionCircle;
  window.drawFogOfWar = drawFogOfWar;
  window.drawToken = drawToken;
  window.resizeCanvas = resizeCanvas;
}

// Export for module usage
export { 
  calculateCanvasLayout, 
  drawClearMap, 
  drawVisionCircle, 
  drawFogOfWar, 
  drawToken,
  resizeCanvas
};