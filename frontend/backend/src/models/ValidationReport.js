const mongoose = require('mongoose');

const scoreExplanationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      default: 'No evaluation provided yet.',
    },
  },
  { _id: false }
);

const validationReportSchema = new mongoose.Schema(
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
    version: {
      type: Number,
      default: 1,
    },
    scores: {
      overall: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting initial validation conversation.' }),
      },
      problemValidation: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting problem validation details.' }),
      },
      customerValidation: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting customer validation details.' }),
      },
      marketValidation: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting market validation details.' }),
      },
      competition: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting competitive landscape analysis.' }),
      },
      executionReadiness: {
        type: scoreExplanationSchema,
        default: () => ({ score: 0, explanation: 'Awaiting MVP and execution plan details.' }),
      },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    risks: [{ type: String }],
    opportunities: [{ type: String }],
    competitorSummary: {
      type: String,
      trim: true,
      default: '',
    },
    customerPersona: {
      type: String,
      trim: true,
      default: '',
    },
    recommendedMVP: {
      type: String,
      trim: true,
      default: '',
    },
    recommendedPricingStrategy: {
      type: String,
      trim: true,
      default: '',
    },
    top5NextActions: [{ type: String }],
    missingInformation: [{ type: String }],
    confidenceLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying latest validation report version per venture
validationReportSchema.index({ ventureId: 1, version: -1 });

const ValidationReport = mongoose.model('ValidationReport', validationReportSchema);

module.exports = ValidationReport;
