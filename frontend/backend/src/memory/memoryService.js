const mongoose = require('mongoose');
const VentureMemory = require('../models/VentureMemory');
const Venture = require('../models/Venture');

// Fast in-memory cache fallback for offline testing or fast retrieval
const inMemoryCache = new Map();

/**
 * Fetch or initialize a VentureMemory document
 */
async function getVentureMemory(ventureId) {
  if (!ventureId) return null;
  const strId = String(ventureId);

  // Check MongoDB if connection ready
  if (mongoose.connection.readyState === 1) {
    try {
      let memory = await VentureMemory.findOne({ ventureId }).lean();
      if (!memory) {
        // Hydrate profile from Venture model if available
        const venture = await Venture.findById(ventureId).lean().catch(() => null);
        memory = await VentureMemory.create({
          ventureId,
          ownerId: venture?.ownerId || venture?.userId,
          profile: {
            name: venture?.ventureName || venture?.name || 'Unnamed Venture',
            industry: venture?.industry || 'Not Specified',
            stage: venture?.stage || 'Idea',
            businessModel: venture?.businessModel || 'Not Specified',
            targetCustomer: venture?.targetCustomer || venture?.customer || 'Not Specified',
            mission: venture?.description || 'Not Specified',
          },
        });
        memory = memory.toObject();
      }
      inMemoryCache.set(strId, memory);
      return memory;
    } catch (err) {
      console.warn('VentureMemory DB fetch error (using fallback):', err.message);
    }
  }

  // Fallback to cache or blank document
  if (!inMemoryCache.has(strId)) {
    inMemoryCache.set(strId, {
      ventureId: strId,
      profile: {
        name: 'Unnamed Venture',
        industry: 'Not Specified',
        stage: 'Idea',
        businessModel: 'Not Specified',
        targetCustomer: 'Not Specified',
        mission: 'Not Specified',
      },
      ideaValidation: {},
      build: {},
      growth: {},
      version: 1,
    });
  }
  return inMemoryCache.get(strId);
}

/**
 * Save full venture memory object
 */
async function saveVentureMemory(ventureId, memoryData) {
  if (!ventureId) return null;
  const strId = String(ventureId);
  inMemoryCache.set(strId, memoryData);

  if (mongoose.connection.readyState === 1) {
    try {
      return await VentureMemory.findOneAndUpdate({ ventureId }, memoryData, {
        upsert: true,
        new: true,
      });
    } catch (err) {
      console.warn('VentureMemory DB save error:', err.message);
    }
  }
  return memoryData;
}

module.exports = {
  getVentureMemory,
  saveVentureMemory,
  inMemoryCache,
};
