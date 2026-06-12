const express = require('express');
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createJob);
router.get('/', getAllJobs);
router.get('/myjobs', auth, getMyJobs);
router.get('/:id', getJobById);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;