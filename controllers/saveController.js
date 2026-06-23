const SavedJob = require('../models/SavedJob');

// Save a job
exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const freelancerId = req.user.id;

    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can save jobs' });
    }

    // Check if already saved
    const existing = await SavedJob.findOne({ freelancerId, jobId });
    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({ freelancerId, jobId });
    res.status(201).json({ message: 'Job saved!', savedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unsave a job
exports.unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const freelancerId = req.user.id;

    const deleted = await SavedJob.findOneAndDelete({ freelancerId, jobId });
    if (!deleted) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job unsaved!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all saved jobs for a freelancer
exports.getSavedJobs = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can view saved jobs' });
    }

    const savedJobs = await SavedJob.find({ freelancerId: req.user.id })
      .populate('jobId', 'title description budget skills clientId')
      .sort({ savedAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if a job is saved by the current freelancer
exports.checkSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const freelancerId = req.user.id;

    const saved = await SavedJob.findOne({ freelancerId, jobId });
    res.json({ saved: !!saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};