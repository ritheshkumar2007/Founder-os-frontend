const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema(
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
    weekNumber: {
      type: Number,
      default: 1,
    },
    completedSummary: {
      type: String,
      trim: true,
      default: '',
    },
    outstandingRisks: [{ type: String }],
    nextPriorities: [{ type: String }],
    pillarProgress: {
      validation: { type: Number, default: 0 },
      product: { type: Number, default: 0 },
      launch: { type: Number, default: 0 },
      growth: { type: Number, default: 0 },
      fundraising: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

weeklyReviewSchema.index({ ventureId: 1, weekNumber: -1 });

const WeeklyReview = mongoose.model('WeeklyReview', weeklyReviewSchema);

module.exports = WeeklyReview;
