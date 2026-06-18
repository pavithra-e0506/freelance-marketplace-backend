const Application = require('../models/Application');
const Job = require('../models/Job');

// 1. Freelancer applies to a job
exports.applyToJob = async (req, res) => {
  try {
    // Check if user is freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply' });
    }

    const { jobId, coverLetter, proposedBudget } = req.body;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status === 'closed') {
      return res.status(400).json({ message: 'This job is already closed' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      freelancerId: req.user.id
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application
    const application = await Application.create({
      jobId,
      freelancerId: req.user.id,
      coverLetter,
      proposedBudget
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Freelancer sees their applications
exports.getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can view applications' });
    }

    const applications = await Application.find({ freelancerId: req.user.id })
      .populate('jobId', 'title budget clientId')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Client sees applicants for their job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the client owns this job
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view applications for your own jobs' });
    }

    const applications = await Application.find({ jobId })
      .populate('freelancerId', 'name email skills');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Client updates application status (accept/reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get the job to check ownership
    const job = await Job.findById(application.jobId);
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update applications for your own jobs' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};