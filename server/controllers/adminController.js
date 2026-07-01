const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { getAdminStats } = require('../services/dashboardService');
const { sendResponse } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/customError');

// @desc    Retrieve admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    return sendResponse(res, 200, 'Admin dashboard stats retrieved successfully.', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    List all users with pagination and role filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort('-createdAt');

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      count: users.length,
      total,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject an employer
// @route   PUT /api/admin/employers/:employerId/verify
// @access  Private (Admin only)
exports.verifyEmployer = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    const { status } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      throw new BadRequestError('Invalid status. Status must be either Verified or Rejected.');
    }

    const profile = await EmployerProfile.findOne({ userId: employerId });
    if (!profile) {
      throw new NotFoundError('Employer profile not found.');
    }

    profile.verificationStatus = status;
    await profile.save();

    return sendResponse(res, 200, `Employer verification status updated to ${status}.`, profile);
  } catch (error) {
    next(error);
  }
};

// @desc    List all jobs in the database (including soft-deleted and closed ones)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Fetch all jobs without soft-delete restriction
    const jobs = await Job.find()
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort('-createdAt');

    const total = await Job.countDocuments();

    return res.status(200).json({
      success: true,
      message: 'All jobs retrieved successfully.',
      count: jobs.length,
      total,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hard-delete a job (specifically fake/spam jobs)
// @route   DELETE /api/admin/jobs/:jobId
// @access  Private (Admin only)
exports.deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job post not found.');
    }

    // Hard delete job record
    await Job.deleteOne({ _id: jobId });

    // Clean up applications and saved jobs
    await Application.deleteMany({ jobId });
    await SavedJob.deleteMany({ jobId });

    return sendResponse(res, 200, 'Spam job post and all its applications deleted permanently.');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and associated profile details cleanly
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (user.role === 'candidate') {
      await CandidateProfile.deleteOne({ userId });
      await Resume.deleteMany({ candidateId: userId });
      await Application.deleteMany({ candidateId: userId });
      await SavedJob.deleteMany({ candidateId: userId });
    } else if (user.role === 'employer') {
      await EmployerProfile.deleteOne({ userId });
      
      const employerJobs = await Job.find({ employerId: userId }).select('_id');
      const jobIds = employerJobs.map(j => j._id);
      
      await Job.deleteMany({ employerId: userId });
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await SavedJob.deleteMany({ jobId: { $in: jobIds } });
    }

    await User.deleteOne({ _id: userId });

    return sendResponse(res, 200, 'User and all associated records deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get custom reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getReports = async (req, res, next) => {
  try {
    // Generate signup stats
    const signupTrend = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    // Application statuses aggregation
    const applicationStatuses = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return sendResponse(res, 200, 'Reports compiled successfully.', {
      signupTrend,
      applicationStatuses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer list with verification status
// @route   GET /api/admin/employer-verifications
// @access  Private (Admin only)
exports.getEmployerVerifications = async (req, res, next) => {
  try {
    const employers = await User.find({ role: 'employer' }).select('-password').sort('-createdAt');
    
    // Fetch all employer profiles to get verification status
    const profiles = await EmployerProfile.find({});
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    const enrichedEmployers = employers.map(emp => {
      const profile = profileMap[emp._id.toString()];
      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        createdAt: emp.createdAt,
        companyName: profile ? profile.companyName : 'N/A',
        verificationStatus: profile ? profile.verificationStatus : 'Pending',
        industry: profile ? profile.industry : null,
        location: profile ? profile.location : null,
      };
    });

    return sendResponse(res, 200, 'Employer verifications retrieved successfully.', enrichedEmployers);
  } catch (error) {
    next(error);
  }
};
