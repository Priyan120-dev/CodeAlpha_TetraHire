const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  timeline: {
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    underReviewAt: Date,
    shortlistedAt: Date,
    interviewAt: Date,
    selectedAt: Date,
    rejectedAt: Date,
  },
});

// Prevent duplicate job applications from same candidate
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ candidateId: 1 });

// Auto populate timeline timestamps
applicationSchema.pre('save', function (next) {
  const now = new Date();
  if (this.isNew) {
    this.timeline.appliedAt = now;
  }
  if (this.isModified('status')) {
    const statusFieldMap = {
      'Applied': 'appliedAt',
      'Under Review': 'underReviewAt',
      'Shortlisted': 'shortlistedAt',
      'Interview': 'interviewAt',
      'Selected': 'selectedAt',
      'Rejected': 'rejectedAt',
    };
    const field = statusFieldMap[this.status];
    if (field) {
      this.timeline[field] = now;
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
