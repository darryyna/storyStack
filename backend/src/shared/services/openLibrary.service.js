const axios = require('axios');
const logger = require('../configuration/logger');

const openLibraryUrl = process.env.OPEN_LIBRARY_API_URL;

// search OpenLibrary API and normalize results to unified SearchBook format
async function search(query, limit = 10) {
    logger.info(`Triggering OpenLibrary API search for query: "${query}"`);
    const response = await axios.get(openLibraryUrl, {
        params: {
            q: query,
            limit,
            fields: 'key,title,author_name,cover_i,first_sentence,number_of_pages_median,subject'
        },
        headers: {
            'User-Agent': 'StoryStack/1.0 (book-tracker-app)'
        }
    });

    const docs = response.data.docs || [];
    return docs.map(normalizeOpenLibraryBook);
}

// normalize a single OpenLibrary doc to the unified SearchBook format
function normalizeOpenLibraryBook(doc) {
    return {
        id: doc.key,
        source: 'openlibrary',
        title: doc.title || 'Unknown Title',
        authors: doc.author_name || [],
        thumbnail: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null,
        description: doc.first_sentence
            ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence)
            : null,
        pageCount: doc.number_of_pages_median || (doc.number_of_pages ? doc.number_of_pages[0] : null),
        categories: doc.subject || []
    };
}

module.exports = { search };
