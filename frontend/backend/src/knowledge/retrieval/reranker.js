/**
 * Rerank search results based on semantic score, recency, and deduplication
 */
function rerankResults(results = [], options = {}) {
  if (!Array.isArray(results) || results.length === 0) return [];
  const { topK = 5, minScore = 0.1 } = options;

  const seen = new Set();
  const filtered = [];

  for (const item of results) {
    if (!item || !item.content || item.score < minScore) continue;

    // Deduplicate near-identical snippets
    const snippetKey = item.content.trim().substring(0, 100).toLowerCase();
    if (seen.has(snippetKey)) continue;
    seen.add(snippetKey);

    // Calculate boosted score
    let finalScore = item.score;
    if (item.createdAt) {
      const ageHours = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageHours < 24) finalScore += 0.05; // recency boost
    }

    filtered.push({
      ...item,
      finalScore,
    });
  }

  return filtered.sort((a, b) => b.finalScore - a.finalScore).slice(0, topK);
}

module.exports = {
  rerankResults,
};
