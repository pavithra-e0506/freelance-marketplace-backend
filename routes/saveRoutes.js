const express = require('express');
const {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSaved
} = require('../controllers/saveController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/save', auth, saveJob);
router.delete('/unsave/:jobId', auth, unsaveJob);
router.get('/saved', auth, getSavedJobs);
router.get('/check/:jobId', auth, checkSaved);

module.exports = router;