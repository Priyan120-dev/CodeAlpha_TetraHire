const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const { sendResponse } = require('../utils/response');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customError');
const { sendNotification } = require('../services/notificationService');
const { getEmployerStats } = require('../services/dashboardService');

// @desc    Create a new job post
// @route   POST /api/employer/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res, next) => {
  try {
    const { title, description, location, jobType, employmentType, salary, experience, skillsRequired, category, deadline } = req.body;

    // Strict Employer verification check
    const profile = await EmployerProfile.findOne({ userId: req.user.id });
    if (!profile || profile.verificationStatus !== 'Verified') {
      throw new ForbiddenError(
        `Only verified employers can post new jobs. Your current status is: ${profile ? profile.verificationStatus : 'Pending'}.`
      );
    }

    const job = await Job.create({
      employerId: req.user.id,
      title,
      description,
      location,
      jobType,
      employmentType,
      salary,
      experience,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map(s => s.trim()),
      category,
      deadline: new Date(deadline),
      status: 'Open',
    });

    return sendResponse(res, 201, 'Job posted successfully.', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing job post
// @route   PUT /api/employer/jobs/:jobId
// @access  Private (Employer only)
exports.updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    const job = await Job.findOne({ _id: jobId, employerId: req.user.id, isDeleted: false });
    if (!job) {
      throw new NotFoundError('Job post not found or you are not authorized.');
    }

    // Format skillsRequired if provided as string
    if (updates.skillsRequired && !Array.isArray(updates.skillsRequired)) {
      updates.skillsRequired = updates.skillsRequired.split(',').map((s) => s.trim());
    }

    // Direct Mongoose updates
    Object.keys(updates).forEach((key) => {
      job[key] = updates[key];
    });

    await job.save();

    return sendResponse(res, 200, 'Job updated successfully.', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete job post
// @route   DELETE /api/employer/jobs/:jobId
// @access  Private (Employer only)
exports.deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, employerId: req.user.id, isDeleted: false });
    if (!job) {
      throw new NotFoundError('Job post not found or you are not authorized.');
    }

    job.isDeleted = true;
    job.status = 'Closed';
    await job.save();

    return sendResponse(res, 200, 'Job post deleted successfully (soft delete).');
  } catch (error) {
    next(error);
  }
};

// @desc    View jobs posted by logged-in employer
// @route   GET /api/employer/jobs
// @access  Private (Employer only)
exports.getOwnJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id, isDeleted: false }).sort('-createdAt');
    return sendResponse(res, 200, 'Employer jobs retrieved successfully.', jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    View applicants for a specific job post
// @route   GET /api/employer/jobs/:jobId/applicants
// @access  Private (Employer only)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, employerId: req.user.id, isDeleted: false });
    if (!job) {
      throw new NotFoundError('Job post not found or you are not authorized.');
    }

    const applicants = await Application.find({ jobId })
      .populate({
        path: 'candidateId',
        select: 'name email profileImage',
      })
      .populate({
        path: 'resumeId',
        select: 'fileName fileUrl uploadedAt',
      })
      .sort('-appliedAt');

    return sendResponse(res, 200, 'Applicants retrieved successfully.', applicants);
  } catch (error) {
    next(error);
  }
};

// @desc    Download a candidate's resume securely
// @route   GET /api/employer/resumes/:resumeId/download
// @access  Private (Employer only)
exports.downloadCandidateResume = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found.');
    }

    // Verify candidate has applied to at least one job owned by this employer
    const ownJobs = await Job.find({ employerId: req.user.id, isDeleted: false }).select('_id');
    const ownJobIds = ownJobs.map((j) => j._id);

    const hasApplied = await Application.findOne({
      candidateId: resume.candidateId,
      resumeId,
      jobId: { $in: ownJobIds },
    });

    if (!hasApplied) {
      throw new ForbiddenError('Access Denied: You can only download resumes of candidates who applied to your job posts.');
    }

    const filePath = path.resolve(__dirname, '..', resume.fileUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found on server.');
    }

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job application status
// @route   PUT /api/employer/applications/:applicationId/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application record not found.');
    }

    // Verify job belongs to this employer
    const job = await Job.findOne({ _id: application.jobId, employerId: req.user.id, isDeleted: false });
    if (!job) {
      throw new ForbiddenError('You are not authorized to update status for this application.');
    }

    // Update status and save (triggers pre-save hook for timeline timestamps)
    application.status = status;
    await application.save();

    // Notify Candidate
    await sendNotification(
      application.candidateId,
      'Application Status Updated',
      `Your application status for "${job.title}" has been updated to "${status}".`
    );

    return sendResponse(res, 200, 'Application status updated successfully.', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Close a job post
// @route   PUT /api/employer/jobs/:jobId/close
// @access  Private (Employer only)
exports.closeJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, employerId: req.user.id, isDeleted: false });
    if (!job) {
      throw new NotFoundError('Job post not found or you are not authorized.');
    }

    job.status = 'Closed';
    await job.save();

    return sendResponse(res, 200, 'Job post closed successfully.', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employer Dashboard Stats
// @route   GET /api/employer/dashboard
// @access  Private (Employer only)
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await getEmployerStats(req.user.id);
    return sendResponse(res, 200, 'Employer dashboard stats retrieved successfully.', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload company logo image
// @route   POST /api/employer/upload-logo
// @access  Private (Employer only)
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Please upload an image file named logo.');
    }
    const logoUrl = `uploads/logos/${req.file.filename}`;
    await EmployerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { logo: logoUrl },
      { upsert: true }
    );
    return sendResponse(res, 200, 'Company logo uploaded successfully.', { logoUrl });
  } catch (error) {
    next(error);
  }
};
