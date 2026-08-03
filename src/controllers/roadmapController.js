const BuildRoadmap = require('../models/BuildRoadmap');
const Venture = require('../models/Venture');
const { generateBuildRoadmapFromGemini } = require('../services/roadmapGeminiService');

/**
 * Controller to handle POST /api/build-roadmap/generate
 */
async function generateRoadmap(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, startupIdea, mvpScope, users, stack } = req.body;

    let venture = null;
    if (ventureId) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    // Auto-fill from Venture memory if fields missing
    if (venture) {
      ventureId = venture._id;
      ventureName = ventureName || venture.ventureName || venture.name || 'Untitled Venture';
      startupIdea = startupIdea || venture.brief?.building || 'New Startup Idea';
      mvpScope = mvpScope || '2-week core MVP scope';
      users = users || venture.brief?.audience || 'Target Customers';
      stack = stack || 'React, Node.js, Express, MongoDB Atlas, Gemini AI';
    } else {
      ventureName = ventureName || 'Untitled Venture';
      startupIdea = startupIdea || 'New Startup Idea';
      mvpScope = mvpScope || '2-week core MVP scope';
      users = users || 'Target Customers';
      stack = stack || 'React, Node.js, Express, MongoDB Atlas, Gemini AI';
    }

    // Call Gemini CTO Service
    const generatedRoadmap = await generateBuildRoadmapFromGemini({
      ventureName,
      idea: startupIdea,
      mvpScope,
      users,
      stack,
    });

    // Save to MongoDB
    const newRoadmap = await BuildRoadmap.create({
      userId,
      ventureId: ventureId || undefined,
      ventureName,
      startupIdea,
      mvpScope,
      roadmap: generatedRoadmap,
    });

    return res.status(201).json({
      success: true,
      message: 'Build Roadmap generated successfully',
      buildRoadmap: newRoadmap,
    });
  } catch (error) {
    console.error('Error in roadmapController generateRoadmap:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/build-roadmap/:ventureId
 */
async function getRoadmapHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let roadmaps = [];
    if (ventureId && ventureId !== 'latest') {
      roadmaps = await BuildRoadmap.find({ ventureId, userId }).sort({ createdAt: -1 });
    } else {
      roadmaps = await BuildRoadmap.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = roadmaps[0] || null;

    return res.status(200).json({
      success: true,
      buildRoadmap: latest,
      history: roadmaps,
    });
  } catch (error) {
    console.error('Error in roadmapController getRoadmapHistory:', error);
    next(error);
  }
}

module.exports = {
  generateRoadmap,
  getRoadmapHistory,
};
