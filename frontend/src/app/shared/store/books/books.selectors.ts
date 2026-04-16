import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BooksState } from './books.reducer';

export const selectBooksState = createFeatureSelector<BooksState>('books');

export const selectAllBooks = createSelector(
    selectBooksState,
    (state) => state.books
);

export const selectBooksLoading = createSelector(
    selectBooksState,
    (state) => state.isLoading
);

export const selectSelectedBook = createSelector(
    selectBooksState,
    (state) => state.selectedBook
);

export const selectLatestNote = createSelector(
    selectBooksState,
    (state) => state.latestNote
);

export const selectBooksAdding = createSelector(
    selectBooksState,
    (state) => state.isAdding
);

export const selectBooksError = createSelector(
    selectBooksState,
    (state) => state.error
);
export const selectTotalCount = createSelector(
    selectBooksState,
    (state) => state.totalCount
);

export const selectCurrentPage = createSelector(
    selectBooksState,
    (state) => state.currentPage
);

export const selectTotalPages = createSelector(
    selectBooksState,
    (state) => state.totalPages
);

export const selectCountsByStatus = createSelector(
  selectBooksState,
  (state) => state.countsByStatus
);

export const selectRecommendations = createSelector(
  selectBooksState,
  (state) => state.recommendations
);

export const selectRecommendationsLoading = createSelector(
  selectBooksState,
  (state) => state.recommendationsLoading
);

export const selectAddedFromRecommendations = createSelector(
  selectBooksState,
  state => state.addedFromRecommendations
);

export const selectAddingFromRecommendations = createSelector(
  selectBooksState,
  state => state.addingFromRecommendations
);
