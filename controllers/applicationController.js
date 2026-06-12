const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply to job (freelancer only)
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply' });
    }
    
    const { jobId, coverLetter, proposedBudget } = req.body;
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      freelancerId: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }
    
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

// Get applications for a job (client view)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name email skills');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my applications (freelancer view)
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

// Update application status (client only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const job = await Job.findById(application.jobId);
    
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};