const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: String, // Can be Mongoose ObjectId string or Arbeitnow slug
    required: true,
  },
  source: {
    type: String,
    enum: ['Employer', 'Arbeitnow'],
    default: 'Employer',
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate saved jobs per candidate per job per source
savedJobSchema.index({ candidateId: 1, jobId: 1, source: 1 }, { unique: true });
savedJobSchema.index({ candidateId: 1 });
savedJobSchema.index({ jobId: 1 });
savedJobSchema.index({ source: 1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
