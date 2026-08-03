const mongoose = require('mongoose');

const investorUpdateDocSchema = new mongoose.Schema(
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
    company: { type: String, required: true },
    execSummary: { type: String, required: true },
    progress: { type: String, required: true },
    achievements: { type: String, required: true },
    metrics: { type: String, required: true },
    risks: { type: String, required: true },
    nextMonthGoals: { type: String, required: true },
    fundingAsk: { type: String, required: true },
    fundingReadiness: { type: Number, default: 72 },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

investorUpdateDocSchema.index({ ventureId: 1, version: -1 });

const InvestorUpdateDoc = mongoose.model('InvestorUpdateDoc', investorUpdateDocSchema);

module.exports = InvestorUpdateDoc;
