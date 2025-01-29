const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('Player', playerSchema);
