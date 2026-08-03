const mongoose = require('mongoose');

const developmentPhaseSchema = new mongoose.Schema({
  phaseName: { type: String, required: true },
  duration: { type: String, required: true },
  objectives: { type: String, required: true },
  tasks: [{ type: String }],
  deliverables: [{ type: String }],
  technologies: [{ type: String }],
});

const buildRoadmapSchema = new mongoose.Schema(
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
    mvpScope: {
      type: String,
      default: '',
    },
    roadmap: {
      overview: { type: String, required: true },
      developmentPhases: [developmentPhaseSchema],
      teamRequirements: [{ type: String }],
      risks: [{ type: String }],
      milestones: [{ type: String }],
      launchChecklist: [{ type: String }],
      futureImprovements: [{ type: String }],
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

buildRoadmapSchema.index({ ventureId: 1, createdAt: -1 });

const BuildRoadmap = mongoose.model('BuildRoadmap', buildRoadmapSchema);

module.exports = BuildRoadmap;
