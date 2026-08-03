const mongoose = require('mongoose');

const priorityActionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  priority: { type: String, default: 'High' },
  reason: { type: String, required: true },
});

const ventureIntelligenceSchema = new mongoose.Schema(
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
    healthScore: {
      type: Number,
      required: true,
      default: 80,
    },
    startupStage: {
      type: String,
      required: true,
      default: 'MVP & Early Validation Stage',
    },
    analysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      risks: [{ type: String }],
      opportunities: [{ type: String }],
      priorityActions: [priorityActionSchema],
    },
    metrics: {
      validationScore: { type: Number, default: 85 },
      productProgress: { type: Number, default: 75 },
      marketingScore: { type: Number, default: 70 },
      tractionScore: { type: Number, default: 80 },
      investorScore: { type: Number, default: 78 },
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

ventureIntelligenceSchema.index({ ventureId: 1, createdAt: -1 });

const VentureIntelligence = mongoose.model('VentureIntelligence', ventureIntelligenceSchema);

module.exports = VentureIntelligence;
