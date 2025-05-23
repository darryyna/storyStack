const BookGenreEnum = [
    'action', 'adventure', 'biography', 'children', 'comedy', 'crime', 'drama',
    'fantasy', 'historical', 'horror', 'mystery', 'poetry', 'romance',
    'sci-fi', 'self-help', 'thriller', 'young-adult', 'detective', 'business',
    'history', 'art', 'philosophy', 'psychology', 'science', 'travel', 'food',
    'programming', 'education', 'spirituality', 'memoir', 'true-crime', 'dystopian',
    'classic', 'graphic-novel', 'comic', 'manga', 'novel', 'short-story', 'essay',
    'handbook', 'guide', 'reference', 'textbook', 'autobiography', 'biography', 'journal',
    'other'
];


const BookTypeEnum = ['novel','novella', 'short-story', 'poetry', 'essay', 'comic',
    'manga', 'memoir', 'textbook', 'reference', 'journal',
];

const ReadingStatusEnum = ['reading', 'completed', 'planned', 'onHold', 'dropped'];

module.exports = {
    BookGenreEnum,
    BookTypeEnum,
    ReadingStatusEnum
}