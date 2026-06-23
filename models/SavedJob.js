const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate saves (one freelancer can save a job only once)
savedJobSchema.index({ freelancerId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);