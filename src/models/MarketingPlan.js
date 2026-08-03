const mongoose = require('mongoose');

const customerPersonaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  painPoints: { type: String, required: true },
  needs: { type: String, required: true },
  behavior: { type: String, required: true },
});

const marketingChannelSchema = new mongoose.Schema({
  channel: { type: String, required: true },
  purpose: { type: String, required: true },
  strategy: { type: String, required: true },
});

const contentItemSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  contentType: { type: String, required: true },
  frequency: { type: String, required: true },
});

const roadmapMonthSchema = new mongoose.Schema({
  month: { type: String, required: true },
  goals: { type: String, required: true },
  actions: [{ type: String }],
});

const marketingPlanSchema = new mongoose.Schema(
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
    startupIdea: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      required: true,
      trim: true,
    },
    marketingStrategy: {
      brandPositioning: { type: String, required: true },
      customerPersona: [customerPersonaSchema],
      valueProposition: { type: String, required: true },
      marketingChannels: [marketingChannelSchema],
      contentStrategy: [contentItemSchema],
      launchCampaign: {
        preLaunch: { type: String, required: true },
        launchDay: { type: String, required: true },
        postLaunch: { type: String, required: true },
      },
      growthStrategies: [{ type: String }],
      budgetAllocation: {
        type: Map,
        of: String,
        default: {},
      },
      metricsToTrack: [{ type: String }],
      ninetyDayRoadmap: [roadmapMonthSchema],
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

marketingPlanSchema.index({ ventureId: 1, createdAt: -1 });

const MarketingPlan = mongoose.model('MarketingPlan', marketingPlanSchema);

module.exports = MarketingPlan;
