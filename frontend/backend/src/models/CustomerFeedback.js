const mongoose = require('mongoose');

const customerFeedbackSchema = new mongoose.Schema(
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
    rawText: {
      type: String,
      required: true,
      trim: true,
    },
    customerSegment: {
      type: String,
      default: 'Early Adopter',
      trim: true,
    },
    theme: {
      type: String,
      default: 'General Feedback',
      trim: true,
    },
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
      default: 'NEUTRAL',
    },
    impact: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
  },
  {
    timestamps: true,
  }
);

customerFeedbackSchema.index({ ventureId: 1, theme: 1 });

const CustomerFeedback = mongoose.model('CustomerFeedback', customerFeedbackSchema);

module.exports = CustomerFeedback;
