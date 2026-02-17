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

export const selectBooksAdding = createSelector(
    selectBooksState,
    (state) => state.isAdding
);

export const selectBooksError = createSelector(
    selectBooksState,
    (state) => state.error
);
