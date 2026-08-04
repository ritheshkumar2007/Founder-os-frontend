const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Validation', 'Product', 'Launch', 'Growth', 'Fundraising'],
      default: 'Validation',
    },
    status: {
      type: String,
      enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PLANNED',
    },
    targetDate: {
      type: Date,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({ ventureId: 1, category: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
