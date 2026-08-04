const mongoose = require('mongoose');

const executionTaskSchema = new mongoose.Schema(
  {
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Validation', 'Product', 'Launch', 'Growth', 'Fundraising'],
      default: 'Validation',
      index: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Review', 'Done'],
      default: 'To Do',
      index: true,
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    estimatedEffort: {
      type: String,
      enum: ['Small', 'Medium', 'Large'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['AI_COACH', 'VALIDATION_ENGINE', 'USER', 'SYSTEM'],
      default: 'AI_COACH',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

executionTaskSchema.index({ ventureId: 1, status: 1 });

const ExecutionTask = mongoose.model('ExecutionTask', executionTaskSchema);

module.exports = ExecutionTask;
