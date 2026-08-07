/**
 * Semantic chunker with character overlap
 */
function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || typeof text !== 'string') return [];
  const clean = text.trim();
  if (clean.length === 0) return [];
  if (clean.length <= chunkSize) {
    return [
      {
        chunkId: `chunk_0`,
        content: clean,
        startIndex: 0,
        endIndex: clean.length,
      },
    ];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIdx = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < clean.length) {
      // Find sentence or paragraph break
      const breakPoint = clean.substring(startIndex, endIndex).lastIndexOf('\n');
      const periodPoint = clean.substring(startIndex, endIndex).lastIndexOf('. ');

      if (breakPoint > chunkSize * 0.5) {
        endIndex = startIndex + breakPoint + 1;
      } else if (periodPoint > chunkSize * 0.5) {
        endIndex = startIndex + periodPoint + 1;
      }
    } else {
      endIndex = clean.length;
    }

    const chunkText = clean.substring(startIndex, endIndex).trim();
    if (chunkText.length > 0) {
      chunks.push({
        chunkId: `chunk_${chunkIdx}`,
        content: chunkText,
        startIndex,
        endIndex,
      });
      chunkIdx++;
    }

    if (endIndex >= clean.length) break;
    startIndex = Math.max(startIndex + 1, endIndex - overlap);
  }

  return chunks;
}

module.exports = {
  chunkText,
};
