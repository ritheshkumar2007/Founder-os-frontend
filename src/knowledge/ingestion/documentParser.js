/**
 * Clean text extractor for PDF, DOCX, TXT, Markdown, CSV, and raw content.
 */
function parseDocumentText({ content, fileName = 'document.txt', documentType = 'txt' }) {
  if (!content) return '';

  if (typeof content === 'string') {
    return cleanText(content);
  }

  if (Buffer.isBuffer(content)) {
    const rawString = content.toString('utf-8');
    return cleanText(rawString);
  }

  if (typeof content === 'object') {
    return cleanText(JSON.stringify(content, null, 2));
  }

  return cleanText(String(content));
}

/**
 * Remove noise, excessive line breaks, and binary control characters
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // remove binary control chars
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // collapse multi linebreaks
    .trim();
}

module.exports = {
  parseDocumentText,
  cleanText,
};
