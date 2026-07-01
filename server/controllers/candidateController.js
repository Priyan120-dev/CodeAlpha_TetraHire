const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Notification = require('../models/Notification');
const APIFeatures = require('../utils/apiFeatures');
const { sendResponse } = require('../utils/response');
const { BadRequestError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/customError');
const { sendNotification } = require('../services/notificationService');
const { getNormalizedJobs } = require('../services/jobImportService');

exports.getJobs = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Fetch Employer Jobs from MongoDB (unpaginated)
    const baseQuery = {
      status: 'Open',
      deadline: { $gte: now },
      isDeleted: false,
    };

    let dbQuery = Job.find(baseQuery);
    
    // Apply search filter if present
    if (req.query.search) {
      dbQuery = dbQuery.find({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Apply location filter if present
    if (req.query.location) {
      dbQuery = dbQuery.find({ location: { $regex: req.query.location, $options: 'i' } });
    }

    // Apply jobType filter if present
    if (req.query.jobType) {
      dbQuery = dbQuery.find({ jobType: req.query.jobType });
    }

    // Apply employmentType filter if present
    if (req.query.employmentType) {
      dbQuery = dbQuery.find({ employmentType: req.query.employmentType });
    }

    // Apply category filter if present
    if (req.query.category) {
      dbQuery = dbQuery.find({ category: { $regex: req.query.category, $options: 'i' } });
    }

    // Apply skillsRequired filter if present
    if (req.query.skillsRequired) {
      const skills = req.query.skillsRequired.split(',').map(s => s.trim());
      dbQuery = dbQuery.find({ skillsRequired: { $in: skills } });
    }

    const employerJobsRaw = await dbQuery.sort('-createdAt');

    // Fetch Employer Profiles to populate details
    const employerIds = [...new Set(employerJobsRaw.map((job) => job.employerId))];
    const profiles = await EmployerProfile.find({ userId: { $in: employerIds } });
    const profileMap = {};
    profiles.forEach((profile) => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Normalize Employer Jobs
    const normalizedEmployerJobs = employerJobsRaw.map((job) => {
      const p = profileMap[job.employerId.toString()];
      return {
        _id: job._id.toString(),
        title: job.title,
        companyName: p ? p.companyName : 'Unknown Company',
        companyLogo: p ? p.logo : null,
        companyWebsite: p ? p.website : null,
        companyLocation: p ? p.location : null,
        location: job.location,
        jobType: job.jobType,
        employmentType: job.employmentType,
        salary: job.salary,
        experience: job.experience,
        skillsRequired: job.skillsRequired || [],
        category: job.category,
        deadline: job.deadline,
        status: job.status,
        description: job.description,
        source: 'Employer',
        createdAt: job.createdAt,
      };
    });

    // 2. Fetch Imported Jobs from Arbeitnow API
    let importedJobs = [];
    try {
      importedJobs = await getNormalizedJobs();
    } catch (err) {
      logger.error(`Failed to load imported jobs: ${err.message}`);
    }

    // Filter Imported Jobs in Memory
    let filteredImported = [...importedJobs];

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filteredImported = filteredImported.filter(
        (j) =>
          searchRegex.test(j.title) ||
          searchRegex.test(j.description) ||
          searchRegex.test(j.company) ||
          j.tags.some((t) => searchRegex.test(t))
      );
    }

    if (req.query.location) {
      const locRegex = new RegExp(req.query.location, 'i');
      filteredImported = filteredImported.filter((j) => locRegex.test(j.location));
    }

    if (req.query.jobType) {
      // Mapped values: 'Remote', 'Hybrid', 'Onsite'
      if (req.query.jobType === 'Remote') {
        filteredImported = filteredImported.filter((j) => j.remote === true);
      } else {
        filteredImported = filteredImported.filter((j) => j.remote === false);
      }
    }

    if (req.query.category) {
      const catRegex = new RegExp(req.query.category, 'i');
      filteredImported = filteredImported.filter(
        (j) => catRegex.test(j.title) || j.tags.some((t) => catRegex.test(t))
      );
    }

    if (req.query.skillsRequired) {
      const skills = req.query.skillsRequired.split(',').map(s => s.trim().toLowerCase());
      filteredImported = filteredImported.filter(j => 
        j.tags.some(t => skills.includes(t.toLowerCase()))
      );
    }

    // Format imported jobs to match candidate view
    const formattedImported = filteredImported.map((job) => ({
      _id: job.id, // slug
      title: job.title,
      companyName: job.company,
      companyLogo: null,
      companyWebsite: null,
      companyLocation: job.location,
      location: job.location,
      jobType: job.remote ? 'Remote' : 'Onsite',
      employmentType: 'Full Time',
      salary: null,
      experience: 'N/A',
      skillsRequired: job.tags,
      category: 'Technology',
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far in the future
      status: 'Open',
      description: job.description,
      source: 'Arbeitnow',
      applyUrl: job.applyUrl,
      createdAt: job.createdAt,
    }));

    // 3. Merge both sources
    let combined = [...normalizedEmployerJobs, ...formattedImported];

    // 4. Sort Combined Jobs
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Sort by salary if requested
    if (req.query.sort === 'salary' || req.query.sort === '-salary') {
      combined.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else if (req.query.sort === 'deadline') {
      combined.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    // 5. Paginate Combined Jobs
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const paginated = combined.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      count: paginated.length,
      total: combined.length,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/candidate/saved-jobs
// @access  Private (Candidate only)
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      throw new BadRequestError('jobId is required.');
    }

    const mongoose = require('mongoose');
    let isEmployerJob = false;
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      const job = await Job.findOne({ _id: jobId, isDeleted: false });
      if (job) isEmployerJob = true;
    }

    let source = 'Employer';
    if (!isEmployerJob) {
      const importedJobs = await getNormalizedJobs();
      const exists = importedJobs.some((j) => j.id === jobId);
      if (!exists) {
        throw new NotFoundError('Job not found.');
      }
      source = 'Arbeitnow';
    }

    const existingSave = await SavedJob.findOne({ candidateId: req.user.id, jobId, source });
    if (existingSave) {
      throw new ConflictError('You have already saved this job.');
    }

    await SavedJob.create({ candidateId: req.user.id, jobId, source });

    return sendResponse(res, 201, 'Job saved successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a saved job
// @route   DELETE /api/candidate/saved-jobs/:jobId
// @access  Private (Candidate only)
exports.removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const result = await SavedJob.deleteOne({ candidateId: req.user.id, jobId });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Saved job record not found.');
    }

    return sendResponse(res, 200, 'Saved job removed successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a PDF Resume
// @route   POST /api/candidate/upload-resume
// @access  Private (Candidate only)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Please upload a file named resume.');
    }

    const originalName = req.file.originalname;

    // Security check: Verify candidate does not have a duplicate filename upload
    const duplicate = await Resume.findOne({ candidateId: req.user.id, fileName: originalName });
    if (duplicate) {
      // Unlink temp file
      fs.unlinkSync(req.file.path);
      throw new ConflictError('You have already uploaded a resume with this filename.');
    }

    // Save resume to collection
    const resume = await Resume.create({
      candidateId: req.user.id,
      fileName: originalName,
      fileUrl: `uploads/resumes/${req.file.filename}`,
    });

    // Update candidate profile
    await CandidateProfile.findOneAndUpdate(
      { userId: req.user.id },
      { resume: resume.fileUrl },
      { upsert: true }
    );

    return sendResponse(res, 201, 'Resume uploaded successfully.', resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a job
// @route   POST /api/candidate/apply
// @access  Private (Candidate only)
exports.applyJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, coverLetter } = req.body;

    if (!jobId || !resumeId) {
      throw new BadRequestError('jobId and resumeId are required.');
    }

    // Check if Job exists and is open
    const job = await Job.findOne({ _id: jobId, isDeleted: false });
    if (!job) {
      throw new NotFoundError('Job not found.');
    }

    if (job.status === 'Closed' || job.deadline < new Date()) {
      throw new BadRequestError('Applications are closed for this job because it has expired or has been closed by the employer.');
    }

    // Check if resume belongs to candidate
    const resume = await Resume.findOne({ _id: resumeId, candidateId: req.user.id });
    if (!resume) {
      throw new NotFoundError('Resume not found or does not belong to you.');
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({ jobId, candidateId: req.user.id });
    if (alreadyApplied) {
      throw new ConflictError('You have already applied for this job.');
    }

    // Create Application
    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      resumeId,
      coverLetter,
      status: 'Applied',
    });

    // Notify Employer
    await sendNotification(
      job.employerId,
      'New Job Application',
      `A candidate has applied for your job post: "${job.title}".`
    );

    return sendResponse(res, 201, 'Applied for job successfully.', application);
  } catch (error) {
    next(error);
  }
};

// @desc    View candidate's applied jobs
// @route   GET /api/candidate/applications
// @access  Private (Candidate only)
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title location jobType employmentType salary deadline status',
      })
      .sort('-appliedAt');

    return sendResponse(res, 200, 'Applications retrieved successfully.', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw job application
// @route   DELETE /api/candidate/applications/:applicationId
// @access  Private (Candidate only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ _id: applicationId, candidateId: req.user.id });
    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    await Application.deleteOne({ _id: applicationId });

    return sendResponse(res, 200, 'Application withdrawn successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Download own resume securely
// @route   GET /api/candidate/resumes/:resumeId
// @access  Private (Candidate only)
exports.downloadResume = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, candidateId: req.user.id });
    if (!resume) {
      throw new NotFoundError('Resume not found or access denied.');
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

// @desc    Get a single job details by ID
// @route   GET /api/candidate/jobs/:jobId
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const mongoose = require('mongoose');
    let job = null;
    let employerProfile = null;

    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findOne({ _id: jobId, isDeleted: false });
      if (job) {
        employerProfile = await EmployerProfile.findOne({ userId: job.employerId });
      }
    }

    if (job) {
      const formattedJob = {
        ...job.toObject(),
        companyName: employerProfile ? employerProfile.companyName : 'Unknown Company',
        companyLogo: employerProfile ? employerProfile.logo : null,
        companyWebsite: employerProfile ? employerProfile.website : null,
        companyLocation: employerProfile ? employerProfile.location : null,
        companySize: employerProfile ? employerProfile.companySize : null,
        companyIndustry: employerProfile ? employerProfile.industry : null,
        companyDescription: employerProfile ? employerProfile.description : null,
        source: 'Employer',
      };

      return res.status(200).json({
        success: true,
        message: 'Job details retrieved successfully.',
        data: formattedJob,
      });
    }

    // Try finding in Arbeitnow cache
    const importedJobs = await getNormalizedJobs();
    const importedJob = importedJobs.find((j) => j.id === jobId);

    if (!importedJob) {
      throw new NotFoundError('Job post not found.');
    }

    const formattedJob = {
      _id: importedJob.id,
      title: importedJob.title,
      companyName: importedJob.company,
      companyLogo: null,
      companyWebsite: null,
      companyLocation: importedJob.location,
      location: importedJob.location,
      jobType: importedJob.remote ? 'Remote' : 'Onsite',
      employmentType: 'Full Time',
      salary: null,
      experience: 'N/A',
      skillsRequired: importedJob.tags,
      category: 'Technology',
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far in the future
      status: 'Open',
      description: importedJob.description,
      source: 'Arbeitnow',
      applyUrl: importedJob.applyUrl,
      createdAt: importedJob.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Job details retrieved successfully.',
      data: formattedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidate's uploaded resumes
// @route   GET /api/candidate/resumes
// @access  Private (Candidate only)
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ candidateId: req.user.id }).sort('-uploadedAt');
    return sendResponse(res, 200, 'Resumes retrieved successfully.', resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by employer/user ID
// @route   GET /api/candidate/company/:employerId
// @access  Public
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    const profile = await EmployerProfile.findOne({ userId: employerId });
    if (!profile) {
      throw new NotFoundError('Company profile not found.');
    }
    return sendResponse(res, 200, 'Company profile retrieved successfully.', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidate's saved jobs
// @route   GET /api/candidate/saved-jobs
// @access  Private (Candidate only)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ candidateId: req.user.id }).sort('-createdAt');
    
    const formattedSaved = [];
    let importedJobs = [];
    try {
      importedJobs = await getNormalizedJobs();
    } catch (e) {
      logger.error(`Error loading imported jobs for saved items: ${e.message}`);
    }

    for (const item of saved) {
      if (item.source === 'Employer') {
        const job = await Job.findById(item.jobId);
        if (job) {
          const emp = await EmployerProfile.findOne({ userId: job.employerId });
          formattedSaved.push({
            _id: item._id,
            source: 'Employer',
            jobId: {
              _id: job._id.toString(),
              title: job.title,
              companyName: emp ? emp.companyName : 'Unknown Company',
              companyLogo: emp ? emp.logo : null,
              location: job.location,
              salary: job.salary,
              description: job.description,
              source: 'Employer'
            }
          });
        }
      } else if (item.source === 'Arbeitnow') {
        const job = importedJobs.find(j => j.id === item.jobId);
        if (job) {
          formattedSaved.push({
            _id: item._id,
            source: 'Arbeitnow',
            jobId: {
              _id: job.id, // slug
              title: job.title,
              companyName: job.company,
              companyLogo: null,
              location: job.location,
              salary: null,
              description: job.description,
              source: 'Arbeitnow',
              applyUrl: job.applyUrl
            }
          });
        } else {
          // Placeholder in case external job is not in cache/expired
          formattedSaved.push({
            _id: item._id,
            source: 'Arbeitnow',
            jobId: {
              _id: item.jobId,
              title: 'Imported Position (No longer active)',
              companyName: 'External Employer',
              companyLogo: null,
              location: 'Remote',
              salary: null,
              description: 'This job posting has been closed or is no longer available on the external site.',
              source: 'Arbeitnow',
              applyUrl: '#'
            }
          });
        }
      }
    }

    return sendResponse(res, 200, 'Saved jobs retrieved successfully.', formattedSaved);
  } catch (error) {
    next(error);
  }
};
