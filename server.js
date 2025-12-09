// server.js - Run this on your laptop
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Session management (single session only)
let activeSession = null;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Generate random 4-digit session code
function generateSessionCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Create initial game state
function createGameState() {
  return {
    tokenPos: { x: 0.85, y: 0.85 },
    exploredAreas: [],
    mapImage: null,
    revealRadiusPercent: 8,
    gmTorchlight: false,
    defaultTokenPos: { x: 0.85, y: 0.85 }
  };
}

// Cleanup session after timeout
function scheduleSessionCleanup(session) {
  if (session.cleanupTimer) {
    clearTimeout(session.cleanupTimer);
  }
  
  session.cleanupTimer = setTimeout(() => {
    console.log(`⏰ Session ${session.code} expired after 30 minutes of inactivity`);
    if (activeSession && activeSession.code === session.code) {
      activeSession = null;
    }
  }, SESSION_TIMEOUT);
}

// Serve static files
app.use(express.static('public'));
app.use('/src', express.static('src'));

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const rawIp = req.socket.remoteAddress;
  const ip = rawIp.replace(/^::ffff:/, '').replace(/^::/, '');
  console.log(`New client connected from ${ip}. Total clients: ${wss.clients.size}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch(data.type) {
        case 'createSession':
          // Only allow one session at a time
          if (activeSession) {
            ws.send(JSON.stringify({
              type: 'sessionError',
              error: 'A session already exists. Please join it or wait for it to expire.'
            }));
            return;
          }

          // Create new session
          const sessionCode = generateSessionCode();
          activeSession = {
            code: sessionCode,
            gmClient: ws,
            gameState: createGameState(),
            clients: new Set([ws]),
            createdAt: Date.now()
          };

          ws.isGM = true;
          ws.sessionCode = sessionCode;

          scheduleSessionCleanup(activeSession);

          console.log(`✨ New session created: ${sessionCode}`);

          ws.send(JSON.stringify({
            type: 'sessionCreated',
            sessionCode: sessionCode,
            isGM: true,
            gameState: activeSession.gameState
          }));
          break;

        case 'joinSession':
          const requestedCode = data.sessionCode;

          // Check if session exists
          if (!activeSession || activeSession.code !== requestedCode) {
            ws.send(JSON.stringify({
              type: 'sessionError',
              error: 'Session not found. Please check the code and try again.'
            }));
            return;
          }

          // Add client to session
          activeSession.clients.add(ws);
          ws.sessionCode = requestedCode;
          ws.isGM = false;

          scheduleSessionCleanup(activeSession);

          console.log(`👤 Player joined session ${requestedCode}`);

          ws.send(JSON.stringify({
            type: 'sessionJoined',
            sessionCode: requestedCode,
            isGM: false,
            gameState: activeSession.gameState
          }));
          break;

        case 'move':
          if (!ws.sessionCode || !activeSession || activeSession.code !== ws.sessionCode) {
            return;
          }

          activeSession.gameState.tokenPos = data.tokenPos;
          activeSession.gameState.exploredAreas = data.exploredAreas;
          activeSession.gameState.defaultTokenPos = data.tokenPos;

          broadcastToSession(activeSession, {
            type: 'update',
            tokenPos: data.tokenPos,
            exploredAreas: data.exploredAreas
          }, ws);
          break;

        case 'radius':
          if (!ws.sessionCode || !activeSession || activeSession.code !== ws.sessionCode) {
            return;
          }

          activeSession.gameState.revealRadiusPercent = data.revealRadiusPercent;
          broadcastToSession(activeSession, {
            type: 'radius',
            revealRadiusPercent: data.revealRadiusPercent
          }, ws);
          break;
        
        case 'torchToggle':
          if (!ws.sessionCode || !activeSession || activeSession.code !== ws.sessionCode) {
            return;
          }

          activeSession.gameState.gmTorchlight = data.torchEnabled;
          broadcastToSession(activeSession, {
            type: 'torchToggle',
            torchEnabled: data.torchEnabled
          }, ws);
          break;

        case 'map':
          if (!ws.isGM || !ws.sessionCode || !activeSession || activeSession.code !== ws.sessionCode) {
            return;
          }

          activeSession.gameState.mapImage = data.mapImage;
          activeSession.gameState.defaultTokenPos = { x: 0.85, y: 0.85 };
          activeSession.gameState.tokenPos = { x: 0.85, y: 0.85 };
          activeSession.gameState.exploredAreas = [];

          broadcastToSession(activeSession, {
            type: 'map',
            mapImage: data.mapImage
          }, ws);
          break;

        case 'reset':
          if (!ws.isGM || !ws.sessionCode || !activeSession || activeSession.code !== ws.sessionCode) {
            return;
          }

          activeSession.gameState.tokenPos = activeSession.gameState.defaultTokenPos;
          activeSession.gameState.exploredAreas = [];

          broadcastToSession(activeSession, {
            type: 'reset',
            tokenPos: activeSession.gameState.defaultTokenPos
          }, ws);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', wss.clients.size);

    // Remove from session
    if (activeSession && ws.sessionCode === activeSession.code) {
      activeSession.clients.delete(ws);

      // If GM disconnects or no clients left, schedule cleanup
      if (ws.isGM || activeSession.clients.size === 0) {
        console.log(`📤 ${ws.isGM ? 'GM' : 'Last player'} left session ${activeSession.code}`);
        scheduleSessionCleanup(activeSession);
      }
    }
  });
});

// Broadcast to all clients in a session except sender
function broadcastToSession(session, data, excludeClient = null) {
  const message = JSON.stringify(data);
  session.clients.forEach((client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           VTT Server Running on Port ${PORT}                ║
╚════════════════════════════════════════════════════════════╝

GM: Open http://localhost:${PORT} and create a session
Players: Join with the 4-digit code

Session timeout: 30 minutes of inactivity

Press Ctrl+C to stop the server
`);
});