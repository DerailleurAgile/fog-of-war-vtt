// src/components/Canvas/GameCanvas.jsx

/**
 * Main game canvas component
 * Handles rendering of the map, fog of war, and token
 */
window.GameCanvas = ({
  canvasRef,
  blurCanvasRef,
  mapImage,
  tokenPos,
  exploredAreas,
  revealRadiusPercent,
  gmMode,
  gmTorchlight,
  zoom,
  panOffset,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const { useEffect } = React;
  const CONFIG = window.CONFIG;
  const { 
    calculateCanvasLayout, 
    drawClearMap, 
    drawVisionCircle, 
    drawToken 
  } = window;

  // Canvas rendering effect
  useEffect(() => {
    if (!mapImage) return;

    const canvas = canvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    if (!canvas || !blurCanvas) return;

    const ctx = canvas.getContext('2d');
    const blurCtx = blurCanvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Match canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;
    blurCanvas.width = rect.width;
    blurCanvas.height = rect.height;

    const layout = calculateCanvasLayout(canvas, mapImage, zoom, panOffset);

    // --- Draw main map ---
    drawClearMap(ctx, canvas, mapImage, layout);

    // --- Draw Fog of War / Blur for player view ---
    if (!gmMode) {
      blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
      blurCtx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
      blurCtx.fillRect(0, 0, blurCanvas.width, blurCanvas.height);

      // Apply blur to map
      blurCtx.filter = `blur(${CONFIG.CANVAS.BLUR_AMOUNT}px)`;
      blurCtx.drawImage(mapImage, layout.offsetX, layout.offsetY, layout.scaledWidth, layout.scaledHeight);
      blurCtx.filter = 'none';

      // Apply darkness overlay if torchlight
      if (gmTorchlight) {
        blurCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.CANVAS.DARKNESS_OPACITY})`;
        blurCtx.fillRect(0, 0, blurCanvas.width, blurCanvas.height);
      }

      blurCtx.globalCompositeOperation = 'destination-out';

      const visionRadius = (revealRadiusPercent / 100) * layout.scaledWidth;

      if (gmTorchlight) {
        // Torch mode: reveal only current token
        const x = layout.offsetX + tokenPos.x * layout.scaledWidth;
        const y = layout.offsetY + tokenPos.y * layout.scaledHeight;
        drawVisionCircle(blurCtx, x, y, visionRadius);
      } else {
        // Normal player view: blur entire map except last token drop
        if (isDragging) {
          // While dragging: hide everything (full blur)
          // Do nothing here
        } else {
          // Reveal last token drop
          const last = exploredAreas[exploredAreas.length - 1];
          if (last) {
            const x = layout.offsetX + last.x * layout.scaledWidth;
            const y = layout.offsetY + last.y * layout.scaledHeight;
            drawVisionCircle(blurCtx, x, y, visionRadius);
          }
        }
      }

      blurCtx.globalCompositeOperation = 'source-over';
    } else {
      // GM mode: no blur
      blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
    }

    // --- Draw token on main canvas ---
    drawToken(ctx, tokenPos, layout, revealRadiusPercent, gmMode, gmTorchlight);

  }, [mapImage, tokenPos, exploredAreas, zoom, panOffset, revealRadiusPercent, gmMode, gmTorchlight, isDragging]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="relative w-full h-full">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
        <canvas 
          ref={blurCanvasRef}
          className="absolute inset-0 w-full h-full cursor-move"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      {!mapImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xl">Upload a map to begin</p>
            <p className="text-sm mt-2">Use arrow keys or WASD to move the party token</p>
          </div>
        </div>
      )}
    </div>
  );
};

console.log('✅ GameCanvas component loaded');