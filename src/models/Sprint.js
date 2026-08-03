const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema(
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
    weekNumber: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    weeklyGoal: {
      type: String,
      trim: true,
      default: 'Conduct customer validation and build MVP core feature',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'PLANNED'],
      default: 'ACTIVE',
    },
    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExecutionTask',
      },
    ],
  },
  {
    timestamps: true,
  }
);

sprintSchema.index({ ventureId: 1, status: 1 });

const Sprint = mongoose.model('Sprint', sprintSchema);

module.exports = Sprint;
