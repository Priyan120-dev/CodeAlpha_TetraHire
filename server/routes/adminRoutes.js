const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require login and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Admin Dashboard stats
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.delete('/users/:userId', adminController.deleteUser);

// Employer verification
router.put('/employers/:employerId/verify', adminController.verifyEmployer);

// Job management
router.get('/jobs', adminController.getJobs);
router.delete('/jobs/:jobId', adminController.deleteJob);

// Reports/Analytics
router.get('/reports', adminController.getReports);

// Employer verification list (with verification status)
router.get('/employer-verifications', adminController.getEmployerVerifications);

module.exports = router;
