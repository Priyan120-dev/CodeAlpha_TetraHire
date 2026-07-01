const express = require('express');
const { getNormalizedJobs } = require('../services/jobImportService');
const { sendResponse } = require('../utils/response');

const router = express.Router();

/**
 * @openapi
 * /api/jobs/imported:
 *   get:
 *     summary: Retrieve normalized jobs imported from Arbeitnow Job Board API
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Imported jobs retrieved successfully
 */
router.get('/imported', async (req, res, next) => {
  try {
    const jobs = await getNormalizedJobs();
    return sendResponse(res, 200, 'Imported jobs retrieved successfully.', jobs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
