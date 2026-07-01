const express = require('express');
const employerController = require('../controllers/employerController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');

const router = express.Router();

// All employer routes require login and 'employer' role
router.use(protect);
router.use(authorize('employer'));

// Jobs CRUD
router.post('/jobs', employerController.createJob);
router.get('/jobs', employerController.getOwnJobs);
router.put('/jobs/:jobId', employerController.updateJob);
router.delete('/jobs/:jobId', employerController.deleteJob);
router.put('/jobs/:jobId/close', employerController.closeJob);

// Applicants and Resumes
router.get('/jobs/:jobId/applicants', employerController.getJobApplicants);
router.get('/resumes/:resumeId/download', employerController.downloadCandidateResume);
router.put('/applications/:applicationId/status', employerController.updateApplicationStatus);

// Dashboard and Logo upload
router.get('/dashboard', employerController.getDashboard);
router.post('/upload-logo', uploadLogo, employerController.uploadLogo);

module.exports = router;
