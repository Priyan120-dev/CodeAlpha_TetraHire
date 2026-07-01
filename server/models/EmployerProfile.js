const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  companySize: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  logo: {
    type: String, // Path to logo file in uploads/logos/
  },
  description: {
    type: String,
    trim: true,
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

employerProfileSchema.index({ companyName: 1 });
employerProfileSchema.index({ location: 1 });
employerProfileSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
