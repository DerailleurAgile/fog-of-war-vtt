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
  gmTorchlight: false
};

// Serve static files
app.use(express.static('public'));
app.use('/src', express.static('src'));

// Handle WebSocket connections
let gmClient = null;
wss.on('connection', (ws, req) => {

  if (!gmClient) gmClient = ws;
  const isGM = ws === gmClient;
  const rawIp = req.socket.remoteAddress;
  const ip = rawIp.replace(/^::ffff:/, '').replace(/^::/, '');
  console.log(`New client connected from ${ip}. Total clients: ${wss.clients.size}`);

  // Send current game state to new client
  ws.send(JSON.stringify({
    type: 'init',
    state: gameState,
    isGM: isGM
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch(data.type) {
        case 'requestInit':
          // Check if client has GM token
          const isGM = data.gmToken === GM_CLIENT_ID;
          
          // If this is first connection and no GM exists yet, make them GM
          const noGMConnected = ![...wss.clients].some(c => c.isGM);
          if (noGMConnected && !isGM) {
            ws.isGM = true;
            ws.send(JSON.stringify({
              type: 'init',
              state: gameState,
              isGM: true,
              gmToken: GM_CLIENT_ID  // Send token to cache
            }));
          } else {
            ws.isGM = isGM;
            ws.send(JSON.stringify({
              type: 'init',
              state: gameState,
              isGM: isGM
            }));
          }
          break;

        case 'move':
          gameState.tokenPos = data.tokenPos;
          gameState.exploredAreas = data.exploredAreas;
          // Broadcast to all clients
          broadcast({
            type: 'update',
            tokenPos: data.tokenPos,
            exploredAreas: data.exploredAreas
          });
          break;

        case 'radius':
          // Match the property name the client sends
          gameState.revealRadiusPercent = data.revealRadiusPercent;

          broadcast({
            type: 'radius',
            revealRadiusPercent: data.revealRadiusPercent
          });
          break;
        
        case 'torchToggle':
          gameState.gmTorchlight = data.torchEnabled;
          broadcast({
            type: 'torchToggle',
            torchEnabled: data.torchEnabled
          });
          break;

        case 'map':
          gameState.mapImage = data.mapImage;
          broadcast({
            type: 'map',
            mapImage: data.mapImage
          });
          break;

        case 'reset':
          gameState.tokenPos = { x: 0.85, y: 0.85 };
          gameState.exploredAreas = [];
          broadcast({
            type: 'reset'
          });
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

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
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