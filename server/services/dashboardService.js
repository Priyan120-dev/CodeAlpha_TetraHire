const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const EmployerProfile = require('../models/EmployerProfile');

// 1. Candidate Dashboard Stats
const getCandidateStats = async (candidateId) => {
  const [totalApplications, savedJobs, interviews, selectedJobs] = await Promise.all([
    Application.countDocuments({ candidateId }),
    SavedJob.countDocuments({ candidateId }),
    Application.countDocuments({ candidateId, status: 'Interview' }),
    Application.countDocuments({ candidateId, status: 'Selected' }),
  ]);

  return {
    totalApplications,
    savedJobs,
    interviews,
    selectedJobs,
  };
};

// 2. Employer Dashboard Stats
const getEmployerStats = async (employerId) => {
  const now = new Date();
  
  // Find all non-deleted jobs posted by employer
  const jobs = await Job.find({ employerId, isDeleted: false });
  const jobIds = jobs.map((job) => job._id);

  const activeJobsCount = jobs.filter((j) => j.status === 'Open' && j.deadline >= now).length;
  const closedJobsCount = jobs.filter((j) => j.status === 'Closed' || j.deadline < now).length;

  const [totalApplicants, totalSavedJobs] = await Promise.all([
    Application.countDocuments({ jobId: { $in: jobIds } }),
    SavedJob.countDocuments({ jobId: { $in: jobIds } }),
  ]);

  const avgApplicantsPerJob = jobs.length > 0 ? Number((totalApplicants / jobs.length).toFixed(2)) : 0;

  // Retrieve details for the most popular job (highest applications count)
  let mostPopularJob = null;
  if (jobIds.length > 0) {
    const popularJobAgg = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    if (popularJobAgg.length > 0) {
      const popularJobDoc = await Job.findById(popularJobAgg[0]._id).select('title category status');
      if (popularJobDoc) {
        mostPopularJob = {
          jobId: popularJobDoc._id,
          title: popularJobDoc.title,
          category: popularJobDoc.category,
          status: popularJobDoc.status,
          applicantsCount: popularJobAgg[0].count,
        };
      }
    }
  }

  return {
    activeJobs: activeJobsCount,
    closedJobs: closedJobsCount,
    totalApplicants,
    averageApplicantsPerJob: avgApplicantsPerJob,
    mostPopularJob,
    totalSavedJobs,
  };
};

// 3. Admin Dashboard Stats
const getAdminStats = async () => {
  const now = new Date();

  const [
    totalUsers,
    employersCount,
    candidatesCount,
    activeJobsCount,
    closedJobsCount,
    totalApplications,
    pendingVerifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'employer' }),
    User.countDocuments({ role: 'candidate' }),
    Job.countDocuments({ status: 'Open', deadline: { $gte: now }, isDeleted: false }),
    Job.countDocuments({
      $and: [
        { isDeleted: false },
        { $or: [{ status: 'Closed' }, { deadline: { $lt: now } }] },
      ],
    }),
    Application.countDocuments(),
    EmployerProfile.countDocuments({ verificationStatus: 'Pending' }),
  ]);

  // Breakdown of jobs by category
  const jobsByCategory = await Job.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Monthly applications trend
  const monthlyApplications = await Application.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$appliedAt' },
          month: { $month: '$appliedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }, // Last 12 months
  ]);

  // Top hiring companies by active jobs count
  const topHiringCompanies = await Job.aggregate([
    { $match: { status: 'Open', deadline: { $gte: now }, isDeleted: false } },
    { $group: { _id: '$employerId', activeJobsCount: { $sum: 1 } } },
    { $sort: { activeJobsCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'employerprofiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'employerDetails',
      },
    },
    { $unwind: { path: '$employerDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        employerId: '$_id',
        activeJobsCount: 1,
        companyName: { $ifNull: ['$employerDetails.companyName', 'Unknown Company'] },
      },
    },
  ]);

  return {
    totalUsers,
    employers: employersCount,
    candidates: candidatesCount,
    // Aliased fields for frontend compatibility
    totalCandidates: candidatesCount,
    totalEmployers: employersCount,
    totalJobs: activeJobsCount + closedJobsCount,
    totalApplications: totalApplications,
    pendingVerifications,
    activeJobs: activeJobsCount,
    closedJobs: closedJobsCount,
    applications: totalApplications,
    jobsByCategory,
    monthlyApplications,
    topHiringCompanies,
  };
};

module.exports = {
  getCandidateStats,
  getEmployerStats,
  getAdminStats,
};
