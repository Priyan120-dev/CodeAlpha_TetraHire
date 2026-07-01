const express = require('express');
const { body } = require('express-validator');
const candidateController = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @openapi
 * /api/candidate/jobs:
 *   get:
 *     summary: Retrieve, search, filter, and paginate open/active job postings
 *     tags: [Candidate]
 *     parameters:
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search keyword matching job title and description
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter jobs by location (case-insensitive regex)
 *       - name: jobType
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Remote, Hybrid, Onsite]
 *       - name: employmentType
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Full Time, Part Time, Internship]
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: skillsRequired
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter jobs requiring specific skills
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *         description: Sort field, prefix with - for descending (e.g. -salary, -createdAt)
 *       - name: fields
 *         in: query
 *         schema:
 *           type: string
 *         description: Comma separated list of fields to select
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
router.get('/jobs', candidateController.getJobs);
router.get('/jobs/:jobId', candidateController.getJobById);
router.get('/company/:employerId', candidateController.getCompanyProfile);

// Protect all routes below for Candidate role only
router.use(protect);
router.use(authorize('candidate'));

/**
 * @openapi
 * /api/candidate/saved-jobs:
 *   post:
 *     summary: Save a job post to candidate bookmark list
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job saved successfully
 *       409:
 *         description: Job already saved
 */
router.get('/saved-jobs', candidateController.getSavedJobs);
router.post('/saved-jobs', candidateController.saveJob);

/**
 * @openapi
 * /api/candidate/saved-jobs/{jobId}:
 *   delete:
 *     summary: Remove a saved job from candidate bookmark list
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved job removed successfully
 */
router.delete('/saved-jobs/:jobId', candidateController.removeSavedJob);

/**
 * @openapi
 * /api/candidate/upload-resume:
 *   post:
 *     summary: Upload a PDF resume for candidate profile
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file in PDF format (max 5MB)
 *     responses:
 *       201:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file format/size or missing file
 *       409:
 *         description: Resume with same filename already uploaded
 */
router.post('/upload-resume', uploadResume, candidateController.uploadResume);

/**
 * @openapi
 * /api/candidate/apply:
 *   post:
 *     summary: Apply for a job post
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - resumeId
 *             properties:
 *               jobId:
 *                 type: string
 *               resumeId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Applied for job successfully
 *       400:
 *         description: Applications are closed or expired
 *       409:
 *         description: Already applied for this job
 */
router.post(
  '/apply',
  [
    body('jobId').notEmpty().withMessage('jobId is required.'),
    body('resumeId').notEmpty().withMessage('resumeId is required.'),
    validate,
  ],
  candidateController.applyJob
);

/**
 * @openapi
 * /api/candidate/applications:
 *   get:
 *     summary: Get all job applications submitted by candidate
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', candidateController.getApplications);

/**
 * @openapi
 * /api/candidate/applications/{applicationId}:
 *   delete:
 *     summary: Withdraw a job application
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: applicationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 */
router.delete('/applications/:applicationId', candidateController.withdrawApplication);

/**
 * @openapi
 * /api/candidate/resumes/{resumeId}:
 *   get:
 *     summary: Download candidate's own resume securely
 *     tags: [Candidate]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: resumeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file stream
 *       404:
 *         description: Resume not found on server
 */
router.get('/resumes', candidateController.getResumes);
router.get('/resumes/:resumeId', candidateController.downloadResume);

module.exports = router;
