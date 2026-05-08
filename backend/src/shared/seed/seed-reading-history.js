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
  status: String, rating: Number, notes: String,
  quotes: [String], tags: [String],
  startedAt: Date, finishedAt: Date,
  currentPage: Number, folderId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const ReadingLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userBookId: mongoose.Schema.Types.ObjectId,
  date: Date, pagesRead: Number
}, { timestamps: true });

const UserGoalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String, type: String, goalType: String,
  startDate: Date, endDate: Date,
  targetCount: Number, category: String,
  isAchieved: Boolean, isActive: Boolean, deactivatedAt: Date
}, { timestamps: true });

const ExternalBookId = mongoose.models.ExternalBookId || mongoose.model('ExternalBookId', ExternalBookIdSchema);
const UserBook       = mongoose.models.UserBook       || mongoose.model('UserBook', UserBookSchema);
const ReadingLog     = mongoose.models.ReadingLog     || mongoose.model('ReadingLog', ReadingLogSchema);
const UserGoal       = mongoose.models.UserGoal       || mongoose.model('UserGoal', UserGoalSchema);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dateAt(year, month, day, hour = 10) {
  return new Date(year, month - 1, day, hour, 0, 0);
}

const ALL_BOOKS = [
  // Ukrainian classics
  { sourceId: 'ext_kobzar',        title: 'Кобзар',                        authors: ['Тарас Шевченко'],       pageCount: 320, categories: ['Poetry', 'Classic', 'Ukrainian'], tags: ['classic', 'ukrainian'] },
  { sourceId: 'ext_shadows',       title: 'Тіні забутих предків',           authors: ['Михайло Коцюбинський'], pageCount: 180, categories: ['Classic', 'Ukrainian'],           tags: ['classic', 'ukrainian'] },
  { sourceId: 'ext_city',          title: 'Місто',                         authors: ['Валер\'ян Підмогильний'], pageCount: 350, categories: ['Fiction', 'Ukrainian'],         tags: ['ukrainian', 'fiction'] },
  { sourceId: 'ext_forest',        title: 'Лісова пісня',                   authors: ['Леся Українка'],        pageCount: 160, categories: ['Drama', 'Classic', 'Ukrainian'], tags: ['classic', 'ukrainian', 'drama'] },
  { sourceId: 'ext_intermezzo',    title: 'Інтермецо',                     authors: ['Михайло Коцюбинський'], pageCount: 90,  categories: ['Classic', 'Ukrainian'],           tags: ['classic', 'ukrainian'] },
  { sourceId: 'ext_enchanted',     title: 'Зачарована Десна',               authors: ['Олександр Довженко'],   pageCount: 130, categories: ['Memoir', 'Ukrainian'],            tags: ['memoir', 'ukrainian'] },
  { sourceId: 'ext_bot',           title: 'Бот',                           authors: ['Макс Кідрук'],           pageCount: 448, categories: ['Thriller', 'Ukrainian'],          tags: ['thriller', 'ukrainian'] },
  { sourceId: 'ext_edge',          title: 'На межі',                       authors: ['Макс Кідрук'],           pageCount: 380, categories: ['Thriller', 'Ukrainian'],          tags: ['thriller', 'ukrainian'] },
  { sourceId: 'ext_chorna_hora',   title: 'Чорна Гора',                    authors: ['Макс Кідрук'],           pageCount: 512, categories: ['Thriller', 'Ukrainian'],          tags: ['thriller', 'ukrainian'] },
  // Horror / Stephen King
  { sourceId: 'ext_shining',       title: 'The Shining',                   authors: ['Stephen King'],          pageCount: 447, categories: ['Horror', 'Fiction'],              tags: ['horror', 'king'] },
  { sourceId: 'ext_it',            title: 'It',                            authors: ['Stephen King'],          pageCount: 1138,categories: ['Horror', 'Fiction'],              tags: ['horror', 'king'] },
  { sourceId: 'ext_pet',           title: 'Pet Sematary',                  authors: ['Stephen King'],          pageCount: 374, categories: ['Horror', 'Fiction'],              tags: ['horror', 'king'] },
  { sourceId: 'ext_doctor_sleep',  title: 'Doctor Sleep',                  authors: ['Stephen King'],          pageCount: 531, categories: ['Horror', 'Fiction'],              tags: ['horror', 'king'] },
  { sourceId: 'ext_misery',        title: 'Misery',                        authors: ['Stephen King'],          pageCount: 310, categories: ['Horror', 'Thriller'],             tags: ['horror', 'king', 'thriller'] },
  { sourceId: 'ext_stand',         title: 'The Stand',                     authors: ['Stephen King'],          pageCount: 1153,categories: ['Horror', 'Fiction'],              tags: ['horror', 'king'] },
  // Dystopian / Classic
  { sourceId: 'ext_1984',          title: '1984',                          authors: ['George Orwell'],         pageCount: 328, categories: ['Dystopian', 'Classic', 'Fiction'], tags: ['dystopian', 'classic'] },
  { sourceId: 'ext_bnw',           title: 'Brave New World',               authors: ['Aldous Huxley'],         pageCount: 311, categories: ['Dystopian', 'Classic'],           tags: ['dystopian', 'classic'] },
  { sourceId: 'ext_451',           title: 'Fahrenheit 451',                authors: ['Ray Bradbury'],          pageCount: 249, categories: ['Dystopian', 'Classic'],           tags: ['dystopian', 'classic'] },
  { sourceId: 'ext_handmaid',      title: "The Handmaid's Tale",           authors: ["Margaret Atwood"],       pageCount: 311, categories: ['Dystopian', 'Fiction'],           tags: ['dystopian', 'fiction'] },
  { sourceId: 'ext_power',         title: 'The Power',                     authors: ['Naomi Alderman'],        pageCount: 386, categories: ['Dystopian', 'Fiction'],           tags: ['dystopian', 'fiction'] },
  // Thriller / Crime
  { sourceId: 'ext_origin',        title: 'Origin',                        authors: ['Dan Brown'],             pageCount: 461, categories: ['Thriller', 'Fiction'],            tags: ['thriller'] },
  { sourceId: 'ext_inferno',       title: 'Inferno',                       authors: ['Dan Brown'],             pageCount: 480, categories: ['Thriller', 'Fiction'],            tags: ['thriller'] },
  { sourceId: 'ext_girl_dragon',   title: 'The Girl with the Dragon Tattoo', authors: ['Stieg Larsson'],      pageCount: 672, categories: ['Crime', 'Thriller'],              tags: ['crime', 'thriller'] },
  { sourceId: 'ext_gone_girl',     title: 'Gone Girl',                     authors: ['Gillian Flynn'],         pageCount: 422, categories: ['Crime', 'Thriller'],              tags: ['crime', 'thriller'] },
  { sourceId: 'ext_silent_patient',title: 'The Silent Patient',            authors: ['Alex Michaelides'],      pageCount: 336, categories: ['Crime', 'Thriller'],              tags: ['crime', 'thriller'] },
  // Fantasy / Sci-fi
  { sourceId: 'ext_hobbit',        title: 'The Hobbit',                    authors: ['J.R.R. Tolkien'],        pageCount: 310, categories: ['Fantasy', 'Fiction'],             tags: ['fantasy'] },
  { sourceId: 'ext_name_wind',     title: 'The Name of the Wind',          authors: ['Patrick Rothfuss'],      pageCount: 662, categories: ['Fantasy', 'Fiction'],             tags: ['fantasy'] },
  { sourceId: 'ext_sapiens',       title: 'Sapiens',                       authors: ['Yuval Noah Harari'],     pageCount: 443, categories: ['History', 'Science'],             tags: ['history', 'nonfiction'] },
  { sourceId: 'ext_atomic',        title: 'Atomic Habits',                 authors: ['James Clear'],           pageCount: 320, categories: ['Self-help', 'Psychology'],        tags: ['self-help', 'productivity'] },
  { sourceId: 'ext_dune',          title: 'Dune',                          authors: ['Frank Herbert'],         pageCount: 688, categories: ['Sci-fi', 'Fiction'],              tags: ['sci-fi', 'fantasy'] },
];

const COMPLETED_BOOKS = [
  // 2024
  { sourceId: 'ext_kobzar',       year: 2024, month: 2, finishDay: 14, readDays: 7,  rating: 5 },
  { sourceId: 'ext_shadows',      year: 2024, month: 3, finishDay: 8,  readDays: 5,  rating: 4 },
  { sourceId: 'ext_1984',         year: 2024, month: 4, finishDay: 22, readDays: 10, rating: 5 },
  { sourceId: 'ext_bnw',          year: 2024, month: 5, finishDay: 30, readDays: 8,  rating: 4 },
  { sourceId: 'ext_shining',      year: 2024, month: 7, finishDay: 15, readDays: 10, rating: 5 },
  { sourceId: 'ext_origin',       year: 2024, month: 8, finishDay: 20, readDays: 9,  rating: 4 },
  { sourceId: 'ext_girl_dragon',  year: 2024, month: 9, finishDay: 25, readDays: 14, rating: 4 },
  { sourceId: 'ext_sapiens',      year: 2024, month: 10, finishDay: 18, readDays: 15, rating: 5 },
  { sourceId: 'ext_forest',       year: 2024, month: 11, finishDay: 10, readDays: 6, rating: 5 },
  { sourceId: 'ext_451',          year: 2024, month: 12, finishDay: 28, readDays: 7, rating: 5 },

  // 2025
  { sourceId: 'ext_atomic',       year: 2025, month: 1,  finishDay: 20, readDays: 10, rating: 5 },
  { sourceId: 'ext_pet',          year: 2025, month: 2,  finishDay: 14, readDays: 9,  rating: 4 },
  { sourceId: 'ext_hobbit',       year: 2025, month: 3,  finishDay: 22, readDays: 8,  rating: 5 },
  { sourceId: 'ext_handmaid',     year: 2025, month: 4,  finishDay: 18, readDays: 10, rating: 5 },
  { sourceId: 'ext_inferno',      year: 2025, month: 5,  finishDay: 30, readDays: 8,  rating: 3 },
  { sourceId: 'ext_bot',          year: 2025, month: 6,  finishDay: 25, readDays: 12, rating: 5 },
  { sourceId: 'ext_it',           year: 2025, month: 8,  finishDay: 10, readDays: 25, rating: 5 },
  { sourceId: 'ext_city',         year: 2025, month: 9,  finishDay: 8,  readDays: 9,  rating: 4 },
  { sourceId: 'ext_gone_girl',    year: 2025, month: 10, finishDay: 15, readDays: 8,  rating: 4 },
  { sourceId: 'ext_power',        year: 2025, month: 11, finishDay: 20, readDays: 11, rating: 4 },
  { sourceId: 'ext_dune',         year: 2025, month: 12, finishDay: 30, readDays: 18, rating: 5 },

  // 2026
  { sourceId: 'ext_kobzar',       year: 2026, month: 1, finishDay: 15, readDays: 7,  rating: 5, skip_if_exists: true },
  { sourceId: 'ext_intermezzo',   year: 2026, month: 1, finishDay: 25, readDays: 4,  rating: 4 },
  { sourceId: 'ext_enchanted',    year: 2026, month: 2, finishDay: 10, readDays: 5,  rating: 5 },
  { sourceId: 'ext_451',          year: 2026, month: 2, finishDay: 28, readDays: 6,  rating: 5, skip_if_exists: true },
  { sourceId: 'ext_misery',       year: 2026, month: 3, finishDay: 18, readDays: 8,  rating: 4 },
  { sourceId: 'ext_name_wind',    year: 2026, month: 3, finishDay: 31, readDays: 15, rating: 5 },
  { sourceId: 'ext_chorna_hora',  year: 2026, month: 4, finishDay: 14, readDays: 12, rating: 5 },
  { sourceId: 'ext_silent_patient',year: 2026, month: 4, finishDay: 22, readDays: 7, rating: 4 },
  { sourceId: 'ext_doctor_sleep', year: 2026, month: 4, finishDay: 30, readDays: 14, rating: 5 },
  { sourceId: 'ext_edge',         year: 2026, month: 5, finishDay: 5,  readDays: 9,  rating: 3 },
];

async function generateReadingLogs(userBookId, book, year, month, finishDay, readDays) {
  const finishDate = dateAt(year, month, finishDay);
  const startDate = new Date(finishDate);
  startDate.setDate(startDate.getDate() - readDays - 2);

  const totalPages = book.pageCount;
  let pagesLeft = totalPages;

  // Generate random reading days within the range
  const allDays = [];
  for (let i = 0; i <= readDays + 2; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d <= finishDate) allDays.push(d);
  }

  // Pick ~75% of days to be active reading days
  const activeDays = allDays
    .sort(() => Math.random() - 0.5)
    .slice(0, readDays)
    .sort((a, b) => a - b);

  const logs = [];
  for (let i = 0; i < activeDays.length; i++) {
    const isLast = i === activeDays.length - 1;
    let pagesRead;
    if (isLast) {
      pagesRead = pagesLeft;
    } else {
      const avg = Math.ceil(pagesLeft / (activeDays.length - i));
      // Occasional big reading day (simulate marathon session)
      const isBig = Math.random() < 0.15;
      if (isBig) {
        pagesRead = Math.min(pagesLeft, randomBetween(200, Math.min(350, totalPages)));
      } else {
        pagesRead = Math.min(pagesLeft, randomBetween(Math.max(15, avg - 40), Math.min(180, avg + 40)));
      }
    }
    if (pagesRead <= 0) continue;
    pagesLeft -= pagesRead;

    const logDate = new Date(activeDays[i]);
    logDate.setHours(randomBetween(8, 23), randomBetween(0, 59), 0, 0);

    logs.push({
      userId: USER_ID,
      userBookId,
      date: logDate,
      pagesRead,
    });
  }
  return logs;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Upsert all external books
  const externalIds = {};
  for (const b of ALL_BOOKS) {
    let ext = await ExternalBookId.findOne({ sourceId: b.sourceId });
    if (!ext) {
      ext = await ExternalBookId.create({
        sourceId: b.sourceId, title: b.title, authors: b.authors,
        thumbnail: '', description: '', pageCount: b.pageCount,
        categories: b.categories
      });
      console.log(`  Created: ${b.title}`);
    }
    externalIds[b.sourceId] = ext._id;
  }

  // 2. Create completed UserBooks + reading logs
  let booksCreated = 0;
  let logsCreated = 0;

  for (const cb of COMPLETED_BOOKS) {
    const bookMeta = ALL_BOOKS.find(b => b.sourceId === cb.sourceId);
    if (!bookMeta) { console.warn(`Book not found: ${cb.sourceId}`); continue; }

    const bookId = externalIds[cb.sourceId];
    const startDate = dateAt(cb.year, cb.month, Math.max(1, cb.finishDay - cb.readDays - 2));
    const finishDate = dateAt(cb.year, cb.month, cb.finishDay, randomBetween(15, 22));

    // For books that might already exist (re-reads), use a unique key by year
    const existingQuery = cb.skip_if_exists
      ? { userId: USER_ID, bookId }
      : { userId: USER_ID, bookId, finishedAt: { $gte: dateAt(cb.year, 1, 1), $lte: dateAt(cb.year, 12, 31) } };

    let ub = await UserBook.findOne(existingQuery);
    if (!ub) {
      ub = await UserBook.create({
        userId: USER_ID, bookId,
        status: 'completed',
        rating: cb.rating,
        tags: bookMeta.tags || [],
        quotes: [],
        currentPage: bookMeta.pageCount,
        startedAt: startDate,
        finishedAt: finishDate,
      });
      booksCreated++;

      const logs = await generateReadingLogs(
        ub._id, bookMeta, cb.year, cb.month, cb.finishDay, cb.readDays
      );
      for (const log of logs) {
        await ReadingLog.create(log);
        logsCreated++;
      }
      console.log(`  ✓ ${cb.year} ${bookMeta.title} (${bookMeta.pageCount}p, ${cb.readDays} days)`);
    } else {
      console.log(`  - Skip (exists): ${bookMeta.title} ${cb.year}`);
    }
  }

  // 3. Add some "currently reading" books
  const currentlyReading = [
    { sourceId: 'ext_stand', currentPage: 420 },
  ];
  for (const cr of currentlyReading) {
    const bookId = externalIds[cr.sourceId];
    const exists = await UserBook.findOne({ userId: USER_ID, bookId, status: 'reading' });
    if (!exists) {
      const ub = await UserBook.create({
        userId: USER_ID, bookId, status: 'reading',
        currentPage: cr.currentPage,
        startedAt: dateAt(2026, 5, 1),
        tags: ['horror', 'king'],
      });
      // Add some recent reading logs for this book
      for (let i = 5; i >= 1; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        d.setHours(21, 0, 0, 0);
        await ReadingLog.create({ userId: USER_ID, userBookId: ub._id, date: d, pagesRead: randomBetween(30, 80) });
        logsCreated++;
      }
      booksCreated++;
      console.log(`  ✓ Currently reading: The Stand`);
    }
  }

  // 4. Planned books
  const planned = ['ext_hobbit', 'ext_name_wind'];
  for (const sourceId of planned) {
    const bookId = externalIds[sourceId];
    const exists = await UserBook.findOne({ userId: USER_ID, bookId });
    if (!exists) {
      await UserBook.create({ userId: USER_ID, bookId, status: 'planned', tags: ['fantasy'] });
    }
  }

  // 5. Goals history
  const goals = [
    { name: 'Read 10 books in 2024',      type: 'YEAR',    goalType: 'BOOKS_COUNT', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), targetCount: 10, isAchieved: true,  isActive: false, deactivatedAt: new Date('2025-01-01') },
    { name: 'Q1 2025 reading sprint',      type: 'QUARTER', goalType: 'BOOKS_COUNT', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31'), targetCount: 3,  isAchieved: true,  isActive: false, deactivatedAt: new Date('2025-04-01') },
    { name: '5000 pages in H1 2025',       type: 'HALF_YEAR',goalType:'PAGES_COUNT', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), targetCount: 5000,isAchieved: true, isActive: false, deactivatedAt: new Date('2025-07-01') },
    { name: 'Read 11 books in 2025',       type: 'YEAR',    goalType: 'BOOKS_COUNT', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), targetCount: 11, isAchieved: true,  isActive: false, deactivatedAt: new Date('2026-01-01') },
    { name: 'January reading sprint 2026', type: 'MONTH',   goalType: 'BOOKS_COUNT', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31'), targetCount: 3,  isAchieved: true,  isActive: true },
    { name: 'Read 15 books in 2026',       type: 'YEAR',    goalType: 'BOOKS_COUNT', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), targetCount: 15, isAchieved: false, isActive: true },
    { name: 'Ukrainian books Q2 2026',     type: 'QUARTER', goalType: 'BOOKS_COUNT', startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30'), targetCount: 4,  isAchieved: false, isActive: true, category: 'Ukrainian' },
  ];

  for (const g of goals) {
    const exists = await UserGoal.findOne({ userId: USER_ID, name: g.name });
    if (!exists) {
      await UserGoal.create({ userId: USER_ID, ...g });
      console.log(`  ✓ Goal: ${g.name}`);
    }
  }

  const totalBooks = await UserBook.countDocuments({ userId: USER_ID });
  const totalLogs  = await ReadingLog.countDocuments({ userId: USER_ID });
  const totalGoals = await UserGoal.countDocuments({ userId: USER_ID });

  console.log('\n==========================================');
  console.log(`Seed complete!`);
  console.log(`  New books created:    ${booksCreated}`);
  console.log(`  New logs created:     ${logsCreated}`);
  console.log(`  Total UserBooks:      ${totalBooks}`);
  console.log(`  Total ReadingLogs:    ${totalLogs}`);
  console.log(`  Total Goals:          ${totalGoals}`);
  console.log('==========================================\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });