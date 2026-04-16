const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../configuration/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

exports.getBookRecommendations = async (userPreferences) => {
  const { authors, titles, descriptions, tags } = userPreferences;

  const prompt = `
You are a book recommendation engine. Based on the user's reading history, return ONLY a JSON array of 6 book recommendations.

User's favorite authors: ${authors.join(', ') || 'unknown'}
Books they've read or are reading: ${titles.join(', ') || 'none'}
Tags/genres they use: ${tags.join(', ') || 'none'}
Book descriptions they've engaged with: ${descriptions.slice(0, 3).join(' | ') || 'none'}

Return ONLY a JSON array in this exact schema, no markdown, no explanations:
[
  {
    "id": "gemini_<unique_short_id>",
    "title": "string",
    "authors": ["string"],
    "description": "string (2-3 sentences)",
    "thumbnail": "",
    "sourceId": "gemini_<unique_short_id>"
  }
]

Rules:
- Recommend books NOT in the user's reading list
- Match genre/style/author preferences closely
- Keep descriptions concise and engaging
- unique_short_id must be unique per item (e.g. rec1, rec2...)
- Output JSON array only
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};