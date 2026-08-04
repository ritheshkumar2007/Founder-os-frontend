const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        'venture_brief',
        'validation_report',
        'customer_persona',
        'competitor_analysis',
        'mvp_scope',
        'gtm_plan',
        'investor_summary',
      ],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    changeExplanation: {
      type: String,
      trim: true,
      default: 'Initial report generated based on startup venture parameters.',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries of latest report versions or report history
reportSchema.index({ ventureId: 1, type: 1, version: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
