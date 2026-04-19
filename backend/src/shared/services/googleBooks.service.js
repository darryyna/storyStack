const axios = require('axios');
const logger = require('../configuration/logger');

const googleApiUrl = process.env.GOOGLE_BOOKS_API_URL;
const googleApiKey = process.env.GOOGLE_API_KEY;

/**
 * Search Google Books API and normalize results to unified SearchBook format.
 * @param {string} query
 * @returns {Promise<Array>} Normalized SearchBook[]
 */
async function search(query) {
    logger.info(`Triggering Google Books API search for query: "${query}"`);
    const response = await axios.get(googleApiUrl, {
        params: {
            q: query,
            key: googleApiKey
        }
    });

    const items = response.data.items || [];
    return items.map(normalizeGoogleBook);
}

/**
 * Normalize a single Google Books item to the unified SearchBook format.
 */
function normalizeGoogleBook(item) {
    const info = item.volumeInfo || {};
    return {
        id: item.id,
        source: 'google',
        title: info.title || 'Unknown Title',
        authors: info.authors || [],
        thumbnail: info.imageLinks?.thumbnail || null,
        description: info.description || null,
        pageCount: info.pageCount || null,
        categories: info.categories || []
    };
}

module.exports = { search };
