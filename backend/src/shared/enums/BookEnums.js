const BookGenre = Object.freeze([
  'action', 'adventure', 'biography', 'children', 'comedy', 'crime', 'drama',
  'fantasy', 'historical', 'horror', 'mystery', 'poetry', 'romance',
  'sci-fi', 'self-help', 'thriller', 'young-adult', 'detective', 'business',
  'history', 'art', 'philosophy', 'psychology', 'science', 'travel', 'food',
  'programming', 'education', 'spirituality', 'memoir', 'true-crime', 'dystopian',
  'classic', 'graphic-novel', 'comic', 'manga', 'novel', 'short-story', 'essay',
  'handbook', 'guide', 'reference', 'textbook', 'autobiography', 'journal',
  'other'
]);


const BookType = Object.freeze([
  'novel','novella', 'short-story', 'poetry', 'essay', 'comic',
  'manga', 'memoir', 'textbook', 'reference', 'journal'
]);

const ReadingStatus = Object.freeze({
  READING: 'reading',
  COMPLETED: 'completed',
  PLANNED: 'planned',
  DROPPED: 'dropped'
});

module.exports = {
  ReadingStatus,
  BookGenre,
  BookType
};