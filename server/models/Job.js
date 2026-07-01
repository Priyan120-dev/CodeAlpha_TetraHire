const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a job location'],
    trim: true,
  },
  jobType: {
    type: String,
    enum: ['Remote', 'Hybrid', 'Onsite'],
    required: [true, 'Please specify job type'],
  },
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Internship'],
    required: [true, 'Please specify employment type'],
  },
  salary: {
    type: Number,
    required: [true, 'Please provide a salary'],
  },
  experience: {
    type: String, // experience description e.g. "3+ years", "Entry Level"
    required: [true, 'Please specify required experience'],
    trim: true,
  },
  skillsRequired: [
    {
      type: String,
      trim: true,
    },
  ],
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify application deadline'],
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Optimize lookups with indexes
jobSchema.index({ employerId: 1 });
jobSchema.index({ title: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ experience: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ isDeleted: 1 });

// Full text index for keyword search
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
