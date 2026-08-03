const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema(
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
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    primaryAgent: {
      type: String,
      required: true,
      index: true,
    },
    secondaryAgents: [{ type: String }],
    routingReasoning: {
      type: String,
      trim: true,
      default: '',
    },
    agentResponse: {
      type: String,
      required: true,
      trim: true,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for querying analytics per venture
agentLogSchema.index({ ventureId: 1, primaryAgent: 1, timestamp: -1 });

const AgentLog = mongoose.model('AgentLog', agentLogSchema);

module.exports = AgentLog;
