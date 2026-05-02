/**
 * Seeds MongoDB with realistic data for a single user:
 *  - Completed UserBooks with finishedAt
 *  - Reading logs for the last 90 days (realistic pace)
 *  - Achieved goals for better AI prediction context
 *
 * Requires: MONGO_URI in .env (or hardcode below for local)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/storyStackDb';
const USER_ID = new mongoose.Types.ObjectId('6974b443bcbb828e337e58f9');
const ExternalBookIdSchema = new mongoose.Schema({
  sourceId: String, title: String, authors: [String],
  thumbnail: String, description: String, pageCount: Number, categories: [String]
});

const UserBookSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  bookId: mongoose.Schema.Types.ObjectId,
  status: String,
  rating: Number, notes: String, quotes: [String], tags: [String],
  startedAt: Date, finishedAt: Date, currentPage: Number, folderId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const ReadingLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userBookId: mongoose.Schema.Types.ObjectId,
  date: Date,
  pagesRead: Number
}, { timestamps: true });

const UserGoalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String, type: String, goalType: String,
  startDate: Date, endDate: Date, targetCount: Number,
  category: String, isAchieved: Boolean
}, { timestamps: true });

const ExternalBookId = mongoose.model('ExternalBookId', ExternalBookIdSchema);
const UserBook       = mongoose.model('UserBook',       UserBookSchema);
const ReadingLog     = mongoose.model('ReadingLog',     ReadingLogSchema);
const UserGoal       = mongoose.model('UserGoal',       UserGoalSchema);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 10) + 8, 0, 0, 0);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NEW_BOOKS = [
  {
    sourceId: 'seed_book_1', title: 'Kobzar', authors: ['Taras Shevchenko'],
    thumbnail: '', description: 'Classic of Ukrainian literature.',
    pageCount: 320, categories: ['Poetry', 'Classic']
  },
  {
    sourceId: 'seed_book_2', title: 'Shadows of Forgotten Ancestors', authors: ['Mykhailo Kotsiubynsky'],
    thumbnail: '', description: 'A tale of Hutsul love and tragedy.',
    pageCount: 180, categories: ['Classic', 'Ukrainian']
  },
  {
    sourceId: 'seed_book_3', title: 'The City', authors: ['Valerian Pidmohylny'],
    thumbnail: '', description: 'A novel about a young provincial in Kyiv.',
    pageCount: 350, categories: ['Fiction', 'Ukrainian']
  },
  {
    sourceId: 'seed_book_4', title: 'The Shining', authors: ['Stephen King'],
    thumbnail: '', description: 'Horror classic about the Overlook Hotel.',
    pageCount: 447, categories: ['Horror', 'Fiction']
  },
  {
    sourceId: 'seed_book_5', title: 'It', authors: ['Stephen King'],
    thumbnail: '', description: 'Seven kids versus an ancient evil in Derry.',
    pageCount: 1138, categories: ['Horror', 'Fiction']
  },
  {
    sourceId: 'seed_book_6', title: 'Pet Sematary', authors: ['Stephen King'],
    thumbnail: '', description: 'A family discovers a burial ground with dark powers.',
    pageCount: 374, categories: ['Horror', 'Fiction']
  },
  {
    sourceId: 'seed_book_7', title: 'Origin', authors: ['Dan Brown'],
    thumbnail: '', description: 'Langdon races to uncover the secret of human origins.',
    pageCount: 461, categories: ['Thriller', 'Fiction']
  },
  {
    sourceId: 'seed_book_8', title: 'Bot', authors: ['Max Kidruk'],
    thumbnail: '', description: 'A techno-thriller about artificial intelligence.',
    pageCount: 448, categories: ['Thriller', 'Ukrainian']
  },
  {
    sourceId: 'seed_book_9', title: 'On the Edge', authors: ['Max Kidruk'],
    thumbnail: '', description: 'Kidruk\'s debut novel.',
    pageCount: 380, categories: ['Thriller', 'Ukrainian']
  },
  {
    sourceId: 'seed_book_10', title: '1984', authors: ['George Orwell'],
    thumbnail: '', description: 'Dystopian masterpiece about Big Brother.',
    pageCount: 328, categories: ['Dystopian', 'Classic', 'Fiction']
  },
  {
    sourceId: 'seed_book_11', title: 'Brave New World', authors: ['Aldous Huxley'],
    thumbnail: '', description: 'A futuristic society built on pleasure and conformity.',
    pageCount: 311, categories: ['Dystopian', 'Classic']
  },
  {
    sourceId: 'seed_book_12', title: 'Fahrenheit 451', authors: ['Ray Bradbury'],
    thumbnail: '', description: 'A fireman who burns books discovers their value.',
    pageCount: 249, categories: ['Dystopian', 'Classic']
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  // 1. Upsert ExternalBookId records
  const externalIds = {};
  for (const bookData of NEW_BOOKS) {
    let ext = await ExternalBookId.findOne({ sourceId: bookData.sourceId });
    if (!ext) {
      ext = await ExternalBookId.create(bookData);
      console.log(`Created ExternalBook: ${bookData.title}`);
    }
    externalIds[bookData.sourceId] = ext._id;
  }

  // 2. Create completed UserBook records
  const completedBooks = [
    // Older reads (60-90 days ago)
    { sourceId: 'seed_book_1',  daysFinished: 87, daysStarted: 94, rating: 5, tags: ['classic', 'ukrainian'] },
    { sourceId: 'seed_book_2',  daysFinished: 80, daysStarted: 84, rating: 4, tags: ['classic', 'ukrainian'] },
    { sourceId: 'seed_book_10', daysFinished: 72, daysStarted: 78, rating: 5, tags: ['dystopian', 'classic'] },
    { sourceId: 'seed_book_11', daysFinished: 65, daysStarted: 70, rating: 4, tags: ['dystopian'] },
    // Mid-range (30-60 days ago)
    { sourceId: 'seed_book_4',  daysFinished: 58, daysStarted: 66, rating: 5, tags: ['horror', 'king'] },
    { sourceId: 'seed_book_6',  daysFinished: 50, daysStarted: 57, rating: 4, tags: ['horror', 'king'] },
    { sourceId: 'seed_book_7',  daysFinished: 42, daysStarted: 48, rating: 4, tags: ['thriller'] },
    { sourceId: 'seed_book_8',  daysFinished: 35, daysStarted: 42, rating: 5, tags: ['thriller', 'ukrainian'] },
    // Recent reads (0-30 days ago)
    { sourceId: 'seed_book_3',  daysFinished: 22, daysStarted: 28, rating: 4, tags: ['ukrainian', 'classic'] },
    { sourceId: 'seed_book_9',  daysFinished: 14, daysStarted: 21, rating: 3, tags: ['thriller', 'ukrainian'] },
    { sourceId: 'seed_book_12', daysFinished: 7,  daysStarted: 12, rating: 5, tags: ['dystopian', 'classic'] },
  ];

  const createdUserBooks = [];

  for (const cb of completedBooks) {
    const bookId = externalIds[cb.sourceId];
    const extBook = NEW_BOOKS.find(b => b.sourceId === cb.sourceId);

    let ub = await UserBook.findOne({ userId: USER_ID, bookId });
    if (!ub) {
      ub = await UserBook.create({
        userId: USER_ID,
        bookId,
        status: 'completed',
        rating: cb.rating,
        tags: cb.tags,
        quotes: [],
        currentPage: extBook.pageCount,
        startedAt: daysAgo(cb.daysStarted),
        finishedAt: daysAgo(cb.daysFinished),
      });
      console.log(`Created UserBook (completed): ${extBook.title}`);
    }
    createdUserBooks.push({ ub, extBook, daysFinished: cb.daysFinished, daysStarted: cb.daysStarted });
  }

  // 3. Generate reading logs for each new book
  for (const { ub, extBook, daysFinished, daysStarted } of createdUserBooks) {
    const existingLogs = await ReadingLog.find({ userBookId: ub._id });
    if (existingLogs.length > 0) {
      console.log(`Logs already exist for: ${extBook.title}, skipping`);
      continue;
    }

    const totalDays  = daysStarted - daysFinished;
    const totalPages = extBook.pageCount;
    let pagesLeft    = totalPages;
    const readingDays = Math.ceil(totalDays * 0.75);

    const dayIndices = [];
    for (let i = daysStarted; i >= daysFinished; i--) dayIndices.push(i);
    dayIndices.sort(() => Math.random() - 0.5);
    const selectedDays = dayIndices.slice(0, readingDays).sort((a, b) => b - a);

    for (let i = 0; i < selectedDays.length; i++) {
      const day    = selectedDays[i];
      const isLast = i === selectedDays.length - 1;
      let pagesRead;

      if (isLast) {
        pagesRead = pagesLeft;
      } else {
        const avgRemaining = Math.ceil(pagesLeft / (selectedDays.length - i));
        pagesRead = Math.min(pagesLeft, randomBetween(
          Math.max(20, avgRemaining - 30),
          Math.min(120, avgRemaining + 30)
        ));
      }

      if (pagesRead <= 0) continue;
      pagesLeft -= pagesRead;

      await ReadingLog.create({
        userId: USER_ID,
        userBookId: ub._id,
        date: daysAgo(day),
        pagesRead,
      });
    }
    console.log(`Created reading logs for: ${extBook.title} (${totalPages}p over ~${readingDays} days)`);
  }

  // 4. Supplement logs for existing completed books
  const existingCompleted = [
    { ubId: '69c9767dcb38caa9d4596e3f', pages: 400, daysAgoRange: [75, 90] }, // Do Not Look Back
    { ubId: '69e0d76c6633c15667c28117', pages: 400, daysAgoRange: [45, 55] }, // Look Into My Dreams
    { ubId: '69e2190947011141cf4cd3c7', pages: 600, daysAgoRange: [30, 45] }, // Doctor Sleep
  ];

  for (const ec of existingCompleted) {
    const ubId = new mongoose.Types.ObjectId(ec.ubId);
    const existingLogs = await ReadingLog.find({ userBookId: ubId });
    if (existingLogs.length >= 3) {
      console.log(`Sufficient logs exist for ubId: ${ec.ubId}, skipping`);
      continue;
    }

    const [endDay, startDay] = ec.daysAgoRange;
    const totalDays   = startDay - endDay;
    const readingDays = Math.ceil(totalDays * 0.7);
    let pagesLeft     = ec.pages - existingLogs.reduce((s, l) => s + l.pagesRead, 0);
    if (pagesLeft <= 0) continue;

    const dayIndices = [];
    for (let i = startDay; i >= endDay; i--) dayIndices.push(i);
    dayIndices.sort(() => Math.random() - 0.5);
    const selectedDays = dayIndices.slice(0, readingDays).sort((a, b) => b - a);

    for (let i = 0; i < selectedDays.length; i++) {
      const day    = selectedDays[i];
      const isLast = i === selectedDays.length - 1;
      let pagesRead;

      if (isLast) {
        pagesRead = pagesLeft;
      } else {
        const avg = Math.ceil(pagesLeft / (selectedDays.length - i));
        pagesRead = Math.min(pagesLeft, randomBetween(Math.max(15, avg - 25), Math.min(100, avg + 25)));
      }

      if (pagesRead <= 0) continue;
      pagesLeft -= pagesRead;

      await ReadingLog.create({
        userId: USER_ID,
        userBookId: ubId,
        date: daysAgo(day),
        pagesRead,
      });
    }
    console.log(`Supplemented reading logs for ubId: ${ec.ubId}`);
  }

  // 5. Create achieved goals for AI prediction context
  const achievedGoals = [
    {
      name: 'January reading sprint',
      type: 'MONTH',
      goalType: 'BOOKS_COUNT',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      targetCount: 3,
      isAchieved: true,
    },
    {
      name: 'Winter pages challenge',
      type: 'MONTH',
      goalType: 'PAGES_COUNT',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      targetCount: 1000,
      isAchieved: true,
    },
    {
      name: 'Q1 reading goal',
      type: 'QUARTER',
      goalType: 'BOOKS_COUNT',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      targetCount: 8,
      isAchieved: true,
    },
  ];

  for (const goalData of achievedGoals) {
    const exists = await UserGoal.findOne({ userId: USER_ID, name: goalData.name });
    if (!exists) {
      await UserGoal.create({ userId: USER_ID, ...goalData });
      console.log(`Created achieved goal: ${goalData.name}`);
    }
  }

  const totalLogs   = await ReadingLog.countDocuments({ userId: USER_ID });
  const totalUBooks = await UserBook.countDocuments({ userId: USER_ID, status: 'completed' });
  const totalGoals  = await UserGoal.countDocuments({ userId: USER_ID });

  console.log('\n===================================');
  console.log(`Seed complete for user: ${USER_ID}`);
  console.log(`  Reading logs:    ${totalLogs}`);
  console.log(`  Completed books: ${totalUBooks}`);
  console.log(`  Goals total:     ${totalGoals}`);
  console.log('===================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});