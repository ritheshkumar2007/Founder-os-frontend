const mongoose = require('mongoose');

const memorySectionSchema = new mongoose.Schema(
  {
    content: { type: String, default: '' },
    summary: { type: String, default: '' },
    version: { type: Number, default: 1 },
    updatedBy: { type: String, default: 'system' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ventureMemorySchema = new mongoose.Schema(
  {
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    profile: {
      name: { type: String, default: 'Unnamed Venture' },
      industry: { type: String, default: 'Not Specified' },
      stage: { type: String, default: 'Idea' },
      businessModel: { type: String, default: 'Not Specified' },
      targetCustomer: { type: String, default: 'Not Specified' },
      mission: { type: String, default: 'Not Specified' },
    },
    ideaValidation: {
      ventureBrief: { type: memorySectionSchema, default: () => ({}) },
      interviewSummaries: { type: memorySectionSchema, default: () => ({}) },
      customerPainPoints: { type: memorySectionSchema, default: () => ({}) },
      assumptions: { type: memorySectionSchema, default: () => ({}) },
      validationResults: { type: memorySectionSchema, default: () => ({}) },
    },
    build: {
      mvpScope: { type: memorySectionSchema, default: () => ({}) },
      roadmap: { type: memorySectionSchema, default: () => ({}) },
      launchPlan: { type: memorySectionSchema, default: () => ({}) },
    },
    growth: {
      marketingPlan: { type: memorySectionSchema, default: () => ({}) },
      tractionMetrics: { type: memorySectionSchema, default: () => ({}) },
      investorUpdates: { type: memorySectionSchema, default: () => ({}) },
    },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.VentureMemory || mongoose.model('VentureMemory', ventureMemorySchema);
