const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Single field index for fast lookups
refreshTokenSchema.index({ token: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
