const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// Get dashboard stats based on user role
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let stats = {};

    if (role === 'client') {
      // Stats for client
      const totalJobs = await Job.countDocuments({ clientId: userId });
      const pendingApplications = await Application.countDocuments({
        status: 'pending'
      }).populate({
        path: 'jobId',
        match: { clientId: userId }
      });
      
      const acceptedApplications = await Application.countDocuments({
        status: 'accepted'
      }).populate({
        path: 'jobId',
        match: { clientId: userId }
      });

      // Jobs over time (for chart)
      const jobsOverTime = await Job.aggregate([
        { $match: { clientId: userId } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      stats = {
        totalJobs,
        pendingApplications,
        acceptedApplications,
        totalApplications: pendingApplications + acceptedApplications,
        jobsOverTime
      };
    } 
    else if (role === 'freelancer') {
      // Stats for freelancer
      const totalApplications = await Application.countDocuments({ freelancerId: userId });
      const pendingApplications = await Application.countDocuments({ 
        freelancerId: userId, 
        status: 'pending' 
      });
      const acceptedApplications = await Application.countDocuments({ 
        freelancerId: userId, 
        status: 'accepted' 
      });
      const rejectedApplications = await Application.countDocuments({ 
        freelancerId: userId, 
        status: 'rejected' 
      });
      const savedJobs = await SavedJob.countDocuments({ freelancerId: userId });

      // Applications over time (for chart)
      const applicationsOverTime = await Application.aggregate([
        { $match: { freelancerId: userId } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      stats = {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        savedJobs,
        applicationsOverTime
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};