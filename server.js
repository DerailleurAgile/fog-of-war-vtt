// server.js - Run this on your laptop
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const GM_CLIENT_ID = 'gm-' + Date.now(); // Generate once on server start

// Game state
let gameState = {
  tokenPos: { x: 0.85, y: 0.85 },
  exploredAreas: [],
  mapImage: null,
  revealRadiusPercent: 8,
  gmTorchlight: false,
  defaultTokenPos: { x: 0.85, y: 0.85 }
};

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
        case 'requestInit':
          // Check if client has GM token
          const hasValidToken = data.gmToken === GM_CLIENT_ID;
          
          // If this is first connection and no GM exists yet, make them GM
          const noGMConnected = ![...wss.clients].some(c => c.isGM);
          if (noGMConnected && !hasValidToken) {
            ws.isGM = true;
            ws.send(JSON.stringify({
              type: 'init',
              state: gameState,
              isGM: true,
              gmToken: GM_CLIENT_ID
            }));
          } else {
            ws.isGM = hasValidToken;
            ws.send(JSON.stringify({
              type: 'init',
              state: gameState,
              isGM: hasValidToken
            }));
          }
          break;

        case 'move':
          gameState.tokenPos = data.tokenPos;
          gameState.exploredAreas = data.exploredAreas;
          gameState.defaultTokenPos = data.tokenPos;
          broadcast({
            type: 'update',
            tokenPos: data.tokenPos,
            exploredAreas: data.exploredAreas
          }, ws);
          break;

        case 'radius':
          gameState.revealRadiusPercent = data.revealRadiusPercent;
          broadcast({
            type: 'radius',
            revealRadiusPercent: data.revealRadiusPercent
          }, ws);
          break;
        
        case 'torchToggle':
          gameState.gmTorchlight = data.torchEnabled;
          broadcast({
            type: 'torchToggle',
            torchEnabled: data.torchEnabled
          }, ws);
          break;

        case 'map':
          if (!ws.isGM) break;
          gameState.mapImage = data.mapImage;
          gameState.defaultTokenPos = { x: 0.85, y: 0.85 };
          gameState.tokenPos = { x: 0.85, y: 0.85 };
          gameState.exploredAreas = [];
          broadcast({
            type: 'map',
            mapImage: data.mapImage
          }, ws);
          break;

        case 'reset':
          if (!ws.isGM) break;
          gameState.tokenPos = gameState.defaultTokenPos;
          gameState.exploredAreas = [];
          broadcast({
            type: 'reset',
            tokenPos: gameState.defaultTokenPos
          }, ws);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', wss.clients.size);
  });
});

function broadcast(data, excludeClient = null) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
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

GM (You): Open http://localhost:${PORT}

Players: Connect to http://[YOUR-IP]:${PORT}

To find your IP address:
  • Windows: Open Command Prompt and type: ipconfig
            Look for "IPv4 Address"
  • Mac/Linux: Open Terminal and type: ifconfig
              Look for "inet" under your active connection

Press Ctrl+C to stop the server
`);
});