const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String,
    },
  ],
  experience: [
    {
      title: String,
      company: String,
      location: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String,
    },
  ],
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  bio: {
    type: String,
    trim: true,
  },
  resume: {
    type: String, // Path to file in uploads/resumes/
  },
  linkedin: {
    type: String,
    trim: true,
  },
  github: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

candidateProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
