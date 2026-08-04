const mongoose = require('mongoose');

const nextActionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  priority: { type: String, default: 'High' },
  expectedImpact: { type: String, required: true },
});

const growthExperimentSchema = new mongoose.Schema({
  experiment: { type: String, required: true },
  goal: { type: String, required: true },
  timeline: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const tractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true,
    },
    ventureName: {
      type: String,
      required: true,
      trim: true,
    },
    metrics: {
      totalUsers: { type: Number, default: 0 },
      monthlyActiveUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      revenue: { type: String, default: '$0' },
      conversionRate: { type: String, default: '0%' },
      retentionRate: { type: String, default: '0%' },
      customerAcquisitionChannels: [{ type: String }],
    },
    customerInsights: [{ type: String }],
    aiAnalysis: {
      growthHealth: { type: String, required: true },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      recommendations: [{ type: String }],
      nextActions: [nextActionSchema],
      growthExperiments: [growthExperimentSchema],
      investorReadinessScore: { type: Number, default: 75 },
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

tractionSchema.index({ ventureId: 1, createdAt: -1 });

const Traction = mongoose.model('Traction', tractionSchema);

module.exports = Traction;
