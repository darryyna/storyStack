import { createReducer, on } from '@ngrx/store';
import * as BooksActions from './books.actions';
import { BookStatus } from '../../../core/models/book.model';
import { BooksState, RecommendationsState } from './books.state';

const initialRecommendationsState: RecommendationsState = {
  items: [],
  isLoading: false,
  addedIds: [],
  addingIds: [],
};

export const initialState: BooksState = {
    books: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    countsByStatus: {
      [BookStatus.Reading]: 0,
      [BookStatus.Planned]: 0,
      [BookStatus.Completed]: 0,
      [BookStatus.Dropped]: 0,
    },
    selectedBook: null,
    latestNote: null,
    cabinetPreview: null,
    cabinetPreviewLoading: false,
    recommendations: initialRecommendationsState,
    isLoading: false,
    isAdding: false,
    error: '',
};

export const booksReducer = createReducer(
    initialState,
    on(BooksActions.loadBooks, state => ({
        ...state,
        isLoading: true,
        error: ''
    })),
    on(BooksActions.loadBooksSuccess, (state, { response }) => ({
      ...state,
      books: response.books,
      totalCount: response.totalCount,
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      countsByStatus: response.countsByStatus,
      isLoading: false
    })),
    on(BooksActions.loadBooksFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BooksActions.loadBook, state => ({
        ...state,
        isLoading: true,
        error: ''
    })),
    on(BooksActions.loadBookSuccess, (state, { book }) => ({
        ...state,
        selectedBook: book,
        isLoading: false
    })),
    on(BooksActions.loadBookFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BooksActions.loadLatestNote, state => ({
        ...state,
        error: ''
    })),
    on(BooksActions.loadLatestNoteSuccess, (state, { note }) => ({
        ...state,
        latestNote: note
    })),
    on(BooksActions.loadLatestNoteFailure, (state) => ({
        ...state,
        latestNote: null
    })),
    on(BooksActions.updateBook, state => ({
        ...state,
        error: ''
    })),
    on(BooksActions.updateBookSuccess, (state, { book }) => ({
        ...state,
        selectedBook: book,
        books: state.books.map(b => b.id === book.id ? book : b),
        isLoading: false
    })),
    on(BooksActions.updateBookFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BooksActions.addBook, state => ({
        ...state,
        isAdding: true,
        error: ''
    })),
  on(BooksActions.addBookSuccess, (state, { book }) => ({
      ...state,
      isAdding: false,
      books: [book, ...state.books],
      totalCount: state.totalCount + 1,
      countsByStatus: {
        ...state.countsByStatus,
        [book.status]: (state.countsByStatus[book.status] ?? 0) + 1
      }
  })),
    on(BooksActions.addBookFailure, (state, { error }) => ({
        ...state,
        isAdding: false,
        error
    })),
    on(BooksActions.deleteBook, state => ({
        ...state,
        isLoading: true,
        error: ''
    })),
  on(BooksActions.deleteBookSuccess, (state, { id }) => {
      const deleted = state.books.find(b => b.id === id);
      return {
        ...state,
        books: state.books.filter(b => b.id !== id),
        totalCount: state.totalCount - 1,
        countsByStatus: deleted ? {
          ...state.countsByStatus,
          [deleted.status]: Math.max(0, state.countsByStatus[deleted.status] - 1)
        } : state.countsByStatus
      };
  }),
    on(BooksActions.deleteBookFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    on(BooksActions.loadRecommendations, state => ({
      ...state,
      recommendations: { ...state.recommendations, isLoading: true },
    })),
    on(BooksActions.loadRecommendationsSuccess, (state, { recommendations }) => ({
      ...state,
      recommendations: { ...state.recommendations, items: recommendations, isLoading: false },
    })),
    on(BooksActions.loadRecommendationsFailure, state => ({
      ...state,
      recommendations: { ...state.recommendations, isLoading: false },
    })),
    on(BooksActions.addBookFromRecommendation, (state, { book }) => ({
      ...state,
      recommendations: {
        ...state.recommendations,
        addingIds: [...state.recommendations.addingIds, book.id],
      },
    })),
    on(BooksActions.addBookFromRecommendationSuccess, (state, { sourceId, addedBook }) => ({
      ...state,
      totalCount: state.totalCount + 1,
      countsByStatus: {
        ...state.countsByStatus,
        [addedBook.status]: (state.countsByStatus[addedBook.status] ?? 0) + 1
      },
      recommendations: {
        ...state.recommendations,
        addingIds: state.recommendations.addingIds.filter(id => id !== sourceId),
        addedIds: [...state.recommendations.addedIds, sourceId],
      },
    })),
    on(BooksActions.addBookFromRecommendationFailure, (state, { sourceId }) => ({
      ...state,
      recommendations: {
        ...state.recommendations,
        addingIds: state.recommendations.addingIds.filter(id => id !== sourceId),
      },
    })),
    on(BooksActions.loadCabinetPreview, state => ({
      ...state,
      cabinetPreviewLoading: true,
    })),
    on(BooksActions.loadCabinetPreviewSuccess, (state, { preview }) => ({
      ...state,
      cabinetPreview: preview,
      cabinetPreviewLoading: false,
      countsByStatus: preview.countsByStatus,
    })),
    on(BooksActions.loadCabinetPreviewFailure, state => ({
      ...state,
      cabinetPreviewLoading: false,
    })),
);
