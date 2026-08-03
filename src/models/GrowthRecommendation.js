const mongoose = require('mongoose');

const growthRecommendationSchema = new mongoose.Schema(
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
      enum: ['Acquisition', 'Activation', 'Monetization', 'Retention', 'Content', 'Experiment'],
      default: 'Acquisition',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    reasoning: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PROPOSED',
    },
  },
  {
    timestamps: true,
  }
);

growthRecommendationSchema.index({ ventureId: 1, priority: -1 });

const GrowthRecommendation = mongoose.model('GrowthRecommendation', growthRecommendationSchema);

module.exports = GrowthRecommendation;
