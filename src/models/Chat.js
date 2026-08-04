const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    workspace: {
      type: String,
      trim: true,
      default: 'General',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true,
    },
    conversation: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Composite index to ensure one chat document per owner & venture pair
chatSchema.index({ owner: 1, venture: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
