const mongoose = require('mongoose');

const growthMetricSchema = new mongoose.Schema(
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
    visitors: {
      type: Number,
      default: 0,
    },
    signups: {
      type: Number,
      default: 0,
    },
    activatedUsers: {
      type: Number,
      default: 0,
    },
    payingCustomers: {
      type: Number,
      default: 0,
    },
    customerInterviews: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    retentionRate: {
      type: Number,
      default: 0,
    },
    growthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bottleneck: {
      type: String,
      trim: true,
      default: 'Awaiting initial metrics data.',
    },
    weeklyReview: {
      type: String,
      trim: true,
      default: '',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

growthMetricSchema.index({ ventureId: 1, recordedAt: -1 });

const GrowthMetric = mongoose.model('GrowthMetric', growthMetricSchema);

module.exports = GrowthMetric;
