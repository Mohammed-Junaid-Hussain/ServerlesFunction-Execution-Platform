const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'javascript'],
  },
  timeout: {
    type: Number,
    default: 30000, // 30 seconds
  },
  virtualization: {
    type: String,
    required: true,
    enum: ['docker', 'firecracker'],
    default: 'docker',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
functionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Function', functionSchema); 