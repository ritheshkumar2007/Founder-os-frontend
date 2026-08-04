const mongoose = require('mongoose');

const mvpScopeSchema = new mongoose.Schema(
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
    idea: {
      type: String,
      required: true,
      trim: true,
    },
    targetUsers: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      required: true,
      trim: true,
    },
    generatedScope: {
      mvpName: { type: String, required: true },
      coreFeatures: [{ type: String }],
      mustHaveFeatures: [{ type: String }],
      niceToHaveFeatures: [{ type: String }],
      featuresToAvoid: [{ type: String }],
      userJourney: [{ type: String }],
      technicalRequirements: [{ type: String }],
      developmentTimeline: [
        {
          phase: { type: String },
          duration: { type: String },
          tasks: [{ type: String }],
        },
      ],
      successMetrics: [{ type: String }],
      futureRoadmap: [{ type: String }],
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

mvpScopeSchema.index({ ventureId: 1, createdAt: -1 });

const MvpScope = mongoose.model('MvpScope', mvpScopeSchema);

module.exports = MvpScope;
