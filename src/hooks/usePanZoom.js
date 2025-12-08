// src/hooks/usePanZoom.js

/**
 * Custom hook for managing pan and zoom state
 * Handles mouse and touch interactions for panning
 */
window.usePanZoom = (initialZoom = 1) => {
  const { useState, useRef } = React;
  const CONFIG = window.CONFIG;
  
  const [zoom, setZoom] = useState(initialZoom);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Track touch panning separately from mouse
  const isTouchPanning = useRef(false);
  const touchStartTimeout = useRef(null);
  const initialTouchCount = useRef(0);

  // Mouse handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers - only for 2+ finger pan
  const handleTouchStart = (e, onSingleTouch) => {
    if (touchStartTimeout.current) {
      clearTimeout(touchStartTimeout.current);
      touchStartTimeout.current = null;
    }

    initialTouchCount.current = e.touches.length;

    if (e.touches.length >= 2) {
      // Two finger pan
      e.preventDefault();
      isTouchPanning.current = true;
      setIsPanning(true);
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else if (e.touches.length === 1 && onSingleTouch) {
      // Single touch - delegate to callback
      const rect = e.target.getBoundingClientRect();
      const touch = e.touches[0];
      
      touchStartTimeout.current = setTimeout(() => {
        if (initialTouchCount.current === 1 && !isTouchPanning.current) {
          onSingleTouch(touch, rect);
        }
        touchStartTimeout.current = null;
      }, CONFIG.MOVEMENT.TOUCH_DELAY_MS);
    }
  };

  const handleTouchMove = (e, onSingleTouch) => {
    e.preventDefault();
    
    if (e.touches.length >= 2) {
      if (touchStartTimeout.current) {
        clearTimeout(touchStartTimeout.current);
        touchStartTimeout.current = null;
      }
      isTouchPanning.current = true;
      setIsPanning(true);
    }
    
    if (e.touches.length >= 2 || isTouchPanning.current) {
      // Two finger pan
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y
      });
    } else if (e.touches.length === 1 && !isTouchPanning.current && !touchStartTimeout.current && onSingleTouch) {
      // Single touch movement - delegate to callback
      const rect = e.target.getBoundingClientRect();
      const touch = e.touches[0];
      onSingleTouch(touch, rect);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartTimeout.current) {
      clearTimeout(touchStartTimeout.current);
      touchStartTimeout.current = null;
    }

    if (e.touches.length === 0) {
      isTouchPanning.current = false;
      setIsPanning(false);
      initialTouchCount.current = 0;
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(4, z + 0.1));
  const zoomOut = () => setZoom(z => Math.max(0.5, z - 0.1));
  const resetZoom = () => setZoom(initialZoom);

  // Reset pan
  const resetPan = () => setPanOffset({ x: 0, y: 0 });

  // Reset both
  const resetView = () => {
    resetZoom();
    resetPan();
  };

  return {
    // State
    zoom,
    panOffset,
    isPanning,
    isTouchPanning: isTouchPanning.current,
    
    // Setters
    setZoom,
    setPanOffset,
    
    // Mouse handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Touch handlers (accept callback for single touch)
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Utilities
    zoomIn,
    zoomOut,
    resetZoom,
    resetPan,
    resetView,
  };
};

console.log('✅ usePanZoom hook loaded');