// src/hooks/useTokenDrag.js

/**
 * Custom hook for handling token dragging (GM only)
 * Allows GM to click and drag the token to move it
 */
window.useTokenDrag = (
  isGM,
  mapImage,
  tokenPos,
  setTokenPos,
  setExploredAreas,
  zoom,
  panOffset,
  wsRef
) => {
  const { useState, useRef } = React;
  const CONFIG = window.CONFIG;
  
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingToken = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleTokenMouseDown = (e, canvasRef) => {
    if (!isGM || !mapImage) return false; // Return false if not handled
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height) * zoom;
    const offsetX = (canvas.width - mapImage.width * scale) / 2 + panOffset.x;
    const offsetY = (canvas.height - mapImage.height * scale) / 2 + panOffset.y;
    const tokenX = offsetX + tokenPos.x * mapImage.width * scale;
    const tokenY = offsetY + tokenPos.y * mapImage.height * scale;

    const dist = Math.hypot(e.clientX - rect.left - tokenX, e.clientY - rect.top - tokenY);
    if (dist <= CONFIG.TOKEN.RADIUS * 1.5) {
      isDraggingToken.current = true;
      setIsDragging(true);
      dragStartOffset.current = {
        x: tokenX - (e.clientX - rect.left),
        y: tokenY - (e.clientY - rect.top)
      };
      e.preventDefault();
      return true; // Return true - token was clicked!
    }
    
    return false; // Return false - token was not clicked
  };

  const handleTokenMouseMove = (e, canvasRef) => {
    if (!isDraggingToken.current || !mapImage) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height) * zoom;
    const offsetX = (canvas.width - mapImage.width * scale) / 2 + panOffset.x;
    const offsetY = (canvas.height - mapImage.height * scale) / 2 + panOffset.y;

    const x = (e.clientX - rect.left + dragStartOffset.current.x - offsetX) / (mapImage.width * scale);
    const y = (e.clientY - rect.top + dragStartOffset.current.y - offsetY) / (mapImage.height * scale);

    const newPos = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };

    if (isGM) {
      setTokenPos(newPos);
    }
  };

  const handleTokenMouseUp = () => {
    if (isDraggingToken.current) {
      isDraggingToken.current = false;
      setIsDragging(false);

      // Commit the position to exploredAreas and notify players
      setExploredAreas(prev => {
        const updated = [...prev, tokenPos];

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'move',
            tokenPos,
            exploredAreas: updated
          }));
        }

        return updated;
      });
    }
  };

  return {
    isDragging,
    handleTokenMouseDown,
    handleTokenMouseMove,
    handleTokenMouseUp,
  };
};

console.log('✅ useTokenDrag hook loaded');