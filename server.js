const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Player = require('./models/player');
const db = require('./database/connection');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Player storage in memory for active players
const activePlayers = new Map();

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New player connected!');

  // Handle messages from clients
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Handle different actions
    switch (data.action) {
      case 'join':
        activePlayers.set(data.playerId, ws);
        ws.send(JSON.stringify({ action: 'welcome', message: `Welcome, ${data.playerName}!` }));
        broadcast({ action: 'updatePlayers', players: [...activePlayers.keys()] });
        break;

      case 'move':
        broadcast({ action: 'playerMove', playerId: data.playerId, position: data.position });
        break;

      case 'leave':
        activePlayers.delete(data.playerId);
        broadcast({ action: 'updatePlayers', players: [...activePlayers.keys()] });
        break;
    }
  });

  // Handle player disconnect
  ws.on('close', () => {
    activePlayers.forEach((socket, playerId) => {
      if (socket === ws) {
        activePlayers.delete(playerId);
        broadcast({ action: 'updatePlayers', players: [...activePlayers.keys()] });
      }
    });
    console.log('Player disconnected');
  });
});

// Helper function to broadcast messages
function broadcast(data) {
  activePlayers.forEach((ws) => {
    ws.send(JSON.stringify(data));
  });
}

// Player authentication endpoint
app.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  try {
    let player = await Player.findOne({ username });
    if (!player) {
      player = new Player({ username, password, stats: { gamesPlayed: 0, wins: 0 } });
      await player.save();
    }
    res.json({ success: true, playerId: player._id, stats: player.stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error authenticating player' });
  }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
