const apiBase = 'http://localhost:3000';
let ws;
let playerId;

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch(`${apiBase}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (data.success) {
    playerId = data.playerId;
    document.getElementById('login').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('welcome-message').innerText = `Welcome, ${username}!`;
    connectWebSocket();
  } else {
    alert('Login failed');
  }
}

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    ws.send(JSON.stringify({ action: 'join', playerId }));
  };

  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.log('Message from server:', data);
  };
}

function leaveGame() {
  ws.send(JSON.stringify({ action: 'leave', playerId }));
  ws.close();
  alert('You left the game');
  location.reload();
}
