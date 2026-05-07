import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BooksState } from './books.state';

export const selectBooksState = createFeatureSelector<BooksState>('books');

// Books
export const selectAllBooks = createSelector(selectBooksState, state => state.books);
export const selectBooksLoading = createSelector(selectBooksState, state => state.isLoading);
export const selectBooksAdding = createSelector(selectBooksState, state => state.isAdding);
export const selectBooksError = createSelector(selectBooksState, state => state.error);
export const selectTotalCount = createSelector(selectBooksState, state => state.totalCount);
export const selectCurrentPage = createSelector(selectBooksState, state => state.currentPage);
export const selectTotalPages = createSelector(selectBooksState, state => state.totalPages);
export const selectCountsByStatus = createSelector(selectBooksState, state => state.countsByStatus);
export const selectCabinetPreview = createSelector(
  selectBooksState, state => state.cabinetPreview
);

export const selectCabinetPreviewLoading = createSelector(
  selectBooksState, state => state.cabinetPreviewLoading
);

// Selected Book
export const selectSelectedBook = createSelector(selectBooksState, state => state.selectedBook);

// Latest Note
export const selectLatestNote = createSelector(selectBooksState, state => state.latestNote);

// Recommendations
export const selectRecommendationsState = createSelector(
  selectBooksState, state => state.recommendations);
export const selectRecommendations = createSelector(
  selectRecommendationsState, rec => rec.items);
export const selectRecommendationsLoading = createSelector(
  selectRecommendationsState, rec => rec.isLoading);
export const selectAddedFromRecommendations = createSelector(
  selectRecommendationsState, rec => rec.addedIds);
export const selectAddingFromRecommendations = createSelector(
  selectRecommendationsState, rec => rec.addingIds);
