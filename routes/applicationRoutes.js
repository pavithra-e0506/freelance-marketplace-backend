const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.post('/apply', auth, applyToJob);
router.get('/my-applications', auth, getMyApplications);
router.get('/job/:jobId', auth, getJobApplications);
router.put('/:id/status', auth, updateApplicationStatus);

module.exports = router;