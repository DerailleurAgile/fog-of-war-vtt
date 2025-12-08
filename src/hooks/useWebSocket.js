// src/hooks/useWebSocket.js

/**
 * Custom hook for managing WebSocket connection and game state sync
 */
window.useWebSocket = (
  setIsGM,
  setGmTorchlight,
  setTokenPos,
  setExploredAreas,
  setRevealRadiusPercent,
  setMapImage,
  setZoom,
  setPanOffset,
  isReceivingUpdate
) => {
  const { useEffect, useRef, useState } = React;
  const CONFIG = window.CONFIG;
  const WS_MESSAGE_TYPES = window.WS_MESSAGE_TYPES;
  
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to server');
      setConnected(true);

      // Check for cached GM token
      const gmToken = localStorage.getItem('vtt_gm_token');
      ws.send(JSON.stringify({
        type: 'requestInit',
        gmToken: gmToken || null
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case WS_MESSAGE_TYPES.INIT:
          setIsGM(data.isGM);
          // If we're GM, cache the token
          if (data.isGM && data.gmToken) {
            localStorage.setItem('vtt_gm_token', data.gmToken);
          }

          if (data.state.gmTorchlight !== undefined) {
            setGmTorchlight(data.state.gmTorchlight);
          }

          if (data.state.tokenPos) setTokenPos(data.state.tokenPos);
          if (data.state.exploredAreas) setExploredAreas(data.state.exploredAreas);
          if (data.state.revealRadiusPercent !== undefined) {
            setRevealRadiusPercent(data.state.revealRadiusPercent);
          }
          if (data.state.mapImage) {
            const img = new Image();
            img.onload = () => setMapImage(img);
            img.src = data.state.mapImage;
          }
          break;

        case WS_MESSAGE_TYPES.UPDATE:
          isReceivingUpdate.current = true;
          setTokenPos(data.tokenPos);
          setExploredAreas(data.exploredAreas);
          setTimeout(() => {
            isReceivingUpdate.current = false;
          }, CONFIG.MOVEMENT.UPDATE_DEBOUNCE_MS);
          break;

        case WS_MESSAGE_TYPES.RADIUS:
          if (isReceivingUpdate.current) break;
          const incoming = Number(data.revealRadiusPercent);
          if (!isNaN(incoming) && isFinite(incoming)) {
            setRevealRadiusPercent(incoming);
          }
          break;

        case WS_MESSAGE_TYPES.TORCH_TOGGLE:
          setGmTorchlight(Boolean(data.torchEnabled));
          break;

        case WS_MESSAGE_TYPES.MAP:
          const img = new Image();
          img.onload = () => setMapImage(img);
          img.src = data.mapImage;
          break;

        case WS_MESSAGE_TYPES.RESET:
          setExploredAreas([]);
          // Use the position from reset message if provided, otherwise use default
          const resetPos = data.tokenPos || CONFIG.DEFAULTS.START_POS;
          setTokenPos(resetPos);
          setZoom(CONFIG.DEFAULTS.ZOOM);
          setPanOffset({ x: 0, y: 0 });
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [
    setIsGM,
    setGmTorchlight,
    setTokenPos,
    setExploredAreas,
    setRevealRadiusPercent,
    setMapImage,
    setZoom,
    setPanOffset,
    isReceivingUpdate
  ]);

  // Helper function to send messages
  const sendMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    wsRef,
    connected,
    sendMessage
  };
};

console.log('✅ useWebSocket hook loaded');