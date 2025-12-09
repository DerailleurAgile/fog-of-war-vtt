// src/hooks/useWebSocket.js

/**
 * Custom hook for managing WebSocket connection and game state sync
 * Now handles session-based connections
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
  const [inSession, setInSession] = useState(false);
  const [sessionCode, setSessionCode] = useState(null);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Check if we have a cached session code
      const cachedSessionCode = localStorage.getItem('vtt_session_code');
      if (cachedSessionCode) {
        console.log('Attempting to rejoin session:', cachedSessionCode);
        ws.send(JSON.stringify({
          type: 'joinSession',
          sessionCode: cachedSessionCode
        }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'sessionCreated':
          console.log('✨ Session created:', data.sessionCode);
          setSessionCode(data.sessionCode);
          setIsGM(data.isGM);
          setInSession(true);
          setSessionError(null);
          
          // Cache session code
          localStorage.setItem('vtt_session_code', data.sessionCode);
          
          // Load game state
          loadGameState(data.gameState);
          break;

        case 'sessionJoined':
          console.log('👤 Joined session:', data.sessionCode);
          setSessionCode(data.sessionCode);
          setIsGM(data.isGM);
          setInSession(true);
          setSessionError(null);
          
          // Cache session code
          localStorage.setItem('vtt_session_code', data.sessionCode);
          
          // Load game state
          loadGameState(data.gameState);
          break;

        case 'sessionError':
          console.error('Session error:', data.error);
          setSessionError(data.error);
          setInSession(false);
          
          // Clear invalid cached session
          localStorage.removeItem('vtt_session_code');
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
      setInSession(false);
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

  // Helper to load game state from server
  const loadGameState = (gameState) => {
    if (gameState.gmTorchlight !== undefined) {
      setGmTorchlight(gameState.gmTorchlight);
    }
    if (gameState.tokenPos) setTokenPos(gameState.tokenPos);
    if (gameState.exploredAreas) setExploredAreas(gameState.exploredAreas);
    if (gameState.revealRadiusPercent !== undefined) {
      setRevealRadiusPercent(gameState.revealRadiusPercent);
    }
    if (gameState.mapImage) {
      const img = new Image();
      img.onload = () => setMapImage(img);
      img.src = gameState.mapImage;
    }
  };

  // Helper function to send messages
  const sendMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Create a new session (GM only)
  const createSession = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'createSession'
      }));
    }
  };

  // Join an existing session (Players)
  const joinSession = (code) => {
    setSessionError(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'joinSession',
        sessionCode: code
      }));
    }
  };

  // Leave session and clear cache
  const leaveSession = () => {
    localStorage.removeItem('vtt_session_code');
    setInSession(false);
    setSessionCode(null);
    window.location.reload();
  };

  return {
    wsRef,
    connected,
    inSession,
    sessionCode,
    sessionError,
    sendMessage,
    createSession,
    joinSession,
    leaveSession
  };
};

console.log('✅ useWebSocket hook loaded');