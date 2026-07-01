const logger = require('../config/logger');

// Cache configuration
let cachedJobs = null;
let lastFetched = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch jobs from Arbeitnow public API
 */
const fetchFromAPI = async () => {
  try {
    logger.info('Fetching jobs from Arbeitnow API...');
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!response.ok) {
      throw new Error(`Arbeitnow API HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    logger.error(`Error in Arbeitnow API fetch: ${error.message}`);
    throw error;
  }
};

/**
 * Normalize an Arbeitnow job object to TetraHire format
 */
const normalizeJob = (job) => {
  return {
    id: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location || 'Remote',
    remote: job.remote || false,
    tags: Array.isArray(job.tags) ? job.tags : [],
    description: job.description,
    applyUrl: job.url,
    source: 'Arbeitnow',
    createdAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString(),
  };
};

/**
 * Get cached and normalized Arbeitnow jobs
 */
const getNormalizedJobs = async () => {
  const now = Date.now();
  
  // If cache is valid, return cached jobs
  if (cachedJobs && (now - lastFetched < CACHE_DURATION)) {
    logger.info('Returning Arbeitnow jobs from cache.');
    return cachedJobs;
  }

  try {
    const rawJobs = await fetchFromAPI();
    const normalized = rawJobs.map(normalizeJob);
    cachedJobs = normalized;
    lastFetched = now;
    logger.info(`Successfully fetched and cached ${normalized.length} jobs from Arbeitnow.`);
    return cachedJobs;
  } catch (error) {
    // If external fetch fails, fall back to cache if available
    if (cachedJobs) {
      logger.warn('Arbeitnow fetch failed. Falling back to cached data.');
      return cachedJobs;
    }
    logger.error('Arbeitnow fetch failed and no cache is available.');
    return []; // Return empty array to prevent application crash
  }
};

module.exports = {
  getNormalizedJobs,
};
