import { Book, BookStatus, SearchBook } from '../../../core/models/book.model';

export interface LatestNoteState {
  bookId: string;
  bookTitle: string;
  lastNote: string;
  timestamp: string;
}

export interface RecommendationsState {
  items: SearchBook[];
  isLoading: boolean;
  addedIds: string[];
  addingIds: string[];
}

export interface BooksState {
  books: Book[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  countsByStatus: Record<BookStatus, number>;
  selectedBook: Book | null;
  latestNote: LatestNoteState | null;
  recommendations: RecommendationsState;
  isLoading: boolean;
  isAdding: boolean;
  error: string;
}
