const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate resume filenames for the same candidate
resumeSchema.index({ candidateId: 1, fileName: 1 }, { unique: true });
resumeSchema.index({ candidateId: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
