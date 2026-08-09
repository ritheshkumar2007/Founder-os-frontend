const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    chunkId: { type: String, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    metadata: { type: Object, default: {} },
  },
  { _id: false }
);

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'pdf',
        'docx',
        'txt',
        'markdown',
        'csv',
        'interview_notes',
        'market_research',
        'competitor_research',
        'product_requirements',
        'roadmap',
        'marketing_plan',
        'investor_update',
        'conversation',
        'notes',
      ],
      default: 'notes',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    source: { type: String, default: 'upload' },
    chunks: [chunkSchema],
    metadata: {
      fileName: { type: String },
      fileSize: { type: Number, default: 0 },
      chunkCount: { type: Number, default: 0 },
      tags: [{ type: String }],
    },
  },
  { timestamps: true }
);

// Compound index for secure multi-tenant filtering
knowledgeDocumentSchema.index({ ventureId: 1, documentType: 1 });

module.exports =
  mongoose.models.KnowledgeDocument ||
  mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
