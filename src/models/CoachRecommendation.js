const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      trim: true,
      default: 'Article',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const coachRecommendationSchema = new mongoose.Schema(
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
    topPriority: {
      type: String,
      trim: true,
      default: '',
    },
    currentFocus: {
      type: String,
      trim: true,
      default: '',
    },
    weeklyGoals: [{ type: String }],
    nextBestAction: {
      type: String,
      trim: true,
      default: '',
    },
    biggestRisk: {
      type: String,
      trim: true,
      default: '',
    },
    biggestOpportunity: {
      type: String,
      trim: true,
      default: '',
    },
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    recommendations: [actionItemSchema],
    learningResources: [learningResourceSchema],
    lastUpdatedFromConversationAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for venture lookup
coachRecommendationSchema.index({ ventureId: 1 });

const CoachRecommendation = mongoose.model('CoachRecommendation', coachRecommendationSchema);

module.exports = CoachRecommendation;
