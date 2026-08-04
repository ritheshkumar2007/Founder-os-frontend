const mongoose = require('mongoose');

const investorUpdateSchema = new mongoose.Schema(
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
    companyOverview: {
      type: String,
      default: '',
    },
    period: {
      month: { type: String, default: 'Current Month' },
      quarter: { type: String, default: 'Q3 2026' },
    },
    startupProgress: {
      milestones: [{ type: String }],
      productUpdates: [{ type: String }],
      tractionHighlights: [{ type: String }],
      revenueUpdates: [{ type: String }],
    },
    investorMessage: {
      summary: { type: String, required: true },
      keyAchievements: [{ type: String }],
      growthMetrics: [{ type: String }],
      challenges: [{ type: String }],
      solutions: [{ type: String }],
      nextQuarterGoals: [{ type: String }],
      fundingNeeds: { type: String, default: '' },
    },
    generatedUpdateText: {
      type: String,
      required: true,
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

investorUpdateSchema.index({ ventureId: 1, createdAt: -1 });

const InvestorUpdate = mongoose.model('InvestorUpdate', investorUpdateSchema);

module.exports = InvestorUpdate;
