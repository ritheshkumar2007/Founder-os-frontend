const mongoose = require('mongoose');

const tractionDataSchema = new mongoose.Schema(
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
    scores: {
      validationScore: { type: Number, default: 78 },
      executionScore: { type: Number, default: 65 },
      growthScore: { type: Number, default: 50 },
      overallScore: { type: Number, default: 64 },
    },
    dashboard: {
      customerInterviews: { type: Number, default: 5 },
      tasksCompleted: { type: Number, default: 8 },
      weeklyProgress: { type: String, default: '65% Sprint Completion' },
      currentFocus: { type: String, default: 'Conduct customer problem validation interviews' },
      biggestRisk: { type: String, default: 'Building features before confirming willingness-to-pay' },
      biggestOpportunity: { type: String, default: 'Strong organic interest from B2B founders' },
      latestRecommendation: { type: String, default: 'Launch 1-on-1 direct outreach to 30 ICP contacts' },
    },
    metricsInput: {
      contacted: { type: Number, default: 25 },
      interviews: { type: Number, default: 5 },
      waitlist: { type: Number, default: 18 },
      active: { type: Number, default: 12 },
      paying: { type: Number, default: 3 },
      revenue: { type: Number, default: 150 },
    },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

tractionDataSchema.index({ ventureId: 1, version: -1 });

const TractionData = mongoose.model('TractionData', tractionDataSchema);

module.exports = TractionData;
