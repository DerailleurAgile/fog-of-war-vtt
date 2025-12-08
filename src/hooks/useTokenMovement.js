// src/hooks/useTokenMovement.js

/**
 * Custom hook for handling keyboard-based token movement
 * Supports arrow keys and WASD
 */
window.useTokenMovement = (tokenPos, setTokenPos, isReceivingUpdate) => {
  const { useEffect } = React;
  const CONFIG = window.CONFIG;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isReceivingUpdate.current) return;
      
      const step = CONFIG.MOVEMENT.STEP;
      setTokenPos(prev => {
        let newPos = { ...prev };
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          newPos.y = Math.max(0, prev.y - step);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          newPos.y = Math.min(1, prev.y + step);
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          newPos.x = Math.max(0, prev.x - step);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          newPos.x = Math.min(1, prev.x + step);
        } else {
          return prev; // No change
        }
        
        return newPos;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokenPos, setTokenPos, isReceivingUpdate]);

  return null; // This hook only sets up event listeners
};

console.log('✅ useTokenMovement hook loaded');