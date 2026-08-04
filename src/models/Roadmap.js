const mongoose = require('mongoose');

const roadmapTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  owner: { type: String, default: 'Founder' },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
  },
  estimatedTime: { type: String, default: '1 day' },
  dependencies: { type: String, default: 'None' },
  done: { type: Boolean, default: false },
});

const phaseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  phase: { type: String, required: true },
  title: { type: String, required: true },
  targetDuration: { type: String, default: 'Days 1-3' },
  tasks: [roadmapTaskSchema],
});

const roadmapSchema = new mongoose.Schema(
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
    phases: [phaseSchema],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ ventureId: 1, version: -1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;
