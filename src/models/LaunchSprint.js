const mongoose = require('mongoose');

const preLaunchItemSchema = new mongoose.Schema({
  day: { type: String, required: true },
  tasks: [{ type: String }],
  owner: { type: String, default: 'Founder' },
  objective: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const launchDayItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  activity: { type: String, required: true },
  responsibility: { type: String, default: 'Founder' },
  done: { type: Boolean, default: false },
});

const postLaunchItemSchema = new mongoose.Schema({
  week: { type: String, required: true },
  actions: [{ type: String }],
  expectedResult: { type: String, required: true },
});

const contentScheduleSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

const launchMetricSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  target: { type: String, required: true },
});

const riskManagementSchema = new mongoose.Schema({
  risk: { type: String, required: true },
  solution: { type: String, required: true },
});

const launchSprintSchema = new mongoose.Schema(
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
    launchDetails: {
      launchDate: { type: String, required: true },
      launchGoal: { type: String, required: true },
      targetAudience: { type: String, required: true },
    },
    sprintPlan: {
      preLaunch: [preLaunchItemSchema],
      launchDay: [launchDayItemSchema],
      postLaunch: [postLaunchItemSchema],
      contentSchedule: [contentScheduleSchema],
      communityStrategy: [{ type: String }],
      userAcquisitionPlan: [{ type: String }],
      launchMetrics: [launchMetricSchema],
      riskManagement: [riskManagementSchema],
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

launchSprintSchema.index({ ventureId: 1, createdAt: -1 });

const LaunchSprint = mongoose.model('LaunchSprint', launchSprintSchema);

module.exports = LaunchSprint;
