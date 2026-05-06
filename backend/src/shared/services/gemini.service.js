const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../configuration/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

exports.getBookRecommendations = async (userPreferences) => {
  const { authors, titles, descriptions, tags } = userPreferences;

  // Use a session-unique prefix so sourceIds never collide across recommendation sessions
  const sessionPrefix = `gemini_${Date.now()}`;

  logger.info(`Requesting book recommendations for ${titles.length} books, ${authors.length} authors`);
  const prompt = `
You are a book recommendation engine. Based on the user's reading history, return ONLY a JSON array of 6 book recommendations.

User's favorite authors: ${authors.join(', ') || 'unknown'}
Books they've read or are reading: ${titles.join(', ') || 'none'}
Tags/genres they use: ${tags.join(', ') || 'none'}
Book descriptions they've engaged with: ${descriptions.slice(0, 3).join(' | ') || 'none'}

Return ONLY a JSON array in this exact schema, no markdown, no explanations:
[
  {
    "id": "${sessionPrefix}_rec1",
    "title": "string",
    "authors": ["string"],
    "description": "string (2-3 sentences)",
    "thumbnail": "",
    "sourceId": "${sessionPrefix}_rec1"
  }
]

Rules:
- Recommend books NOT in the user's reading list
- Match genre/style/author preferences closely
- Keep descriptions concise and engaging
- Replace rec1 with rec1, rec2, rec3, rec4, rec5, rec6 for each item respectively, keeping the same prefix ${sessionPrefix}
- Output JSON array only
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const recommendations = JSON.parse(clean);
    logger.info(`Gemini returned ${recommendations.length} book recommendations`);
    return recommendations;
  } catch (err) {
    logger.error(`Failed to parse Gemini recommendations response: ${err.message}. Raw: ${clean.slice(0, 200)}`);
    throw new Error('Failed to parse recommendations from AI');
  }
};

exports.getGoalPrediction = async ({ goal, readingStats }) => {
  const {
    avgPagesPerDay,
    avgBooksPerMonth,
    activeDaysPerWeek,
    totalPagesLast30Days,
    totalBooksLast90Days,
    achievedGoalsCount,
    daysUntilEnd,
    currentCount,
    targetCount,
    goalType,
    goalPeriod,
    goalName,
  } = readingStats;

  const remaining = targetCount - currentCount;
  const progressPercent = Math.round((currentCount / targetCount) * 100);
  const goalStart = new Date(goal.startDate).toISOString().split('T')[0];
  const goalEnd = new Date(goal.endDate).toISOString().split('T')[0];
  logger.info(`Requesting goal prediction for "${goalName}" (${progressPercent}% complete, ${remaining} remaining, ${daysUntilEnd} days left)`);

  const prompt = `
You are a reading habit analyst. Based on a reader's real statistics, generate a short, encouraging AI prediction for their reading goal.
 
Goal: "${goalName}"
Goal type: ${goalType === 'BOOKS_COUNT' ? 'Read a certain number of books' : 'Read a certain number of pages'}
Goal period: ${goalPeriod} (${goalStart} → ${goalEnd})
Progress: ${currentCount} / ${targetCount} (${progressPercent}%) — ${remaining} remaining
Days remaining until goal deadline: ${daysUntilEnd}
 
Reader's statistics (last 30-90 days):
- Average pages per active reading day: ${avgPagesPerDay}
- Active reading days per week: ${activeDaysPerWeek}
- Books completed per month (average): ${avgBooksPerMonth}
- Total pages read in last 30 days: ${totalPagesLast30Days}
- Books completed in last 90 days: ${totalBooksLast90Days}
- Previously achieved goals: ${achievedGoalsCount}
 
Return ONLY a JSON object, no markdown, no explanation:
{
  "isAchievable": true or false,
  "dailyPagesNeeded": number (pages per day needed to hit goal, or null if goalType is BOOKS_COUNT),
  "booksPerMonthNeeded": number (books per month needed, or null if goalType is PAGES_COUNT),
  "estimatedCompletionDays": number (days from now to complete at current pace, or null if pace is 0),
  "shortMessage": "1-2 sentence encouraging prediction. Be specific with numbers. Ukrainian or English based on goal name language.",
  "tip": "1 short actionable tip to help achieve the goal"
}
 
Rules:
- Be realistic but encouraging
- If goal is already achieved set isAchievable to true and say so in shortMessage
- If pace is clearly insufficient, gently note it but still give a path forward
- Round numbers to reasonable values (e.g. 35 pages/day not 34.7)
- Keep shortMessage under 100 characters
- Keep tip under 80 characters
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const prediction = JSON.parse(clean);
    logger.info(`Gemini prediction for "${goalName}": isAchievable=${prediction.isAchievable}`);
    return prediction;
  } catch (err) {
    logger.error(`Failed to parse Gemini goal prediction response: ${err.message}. Raw: ${clean.slice(0, 200)}`);
    throw new Error('Failed to parse goal prediction from AI');
  }
};