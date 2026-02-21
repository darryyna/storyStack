import { createReducer, on } from '@ngrx/store';
import * as BooksActions from './books.actions';
import { Book } from '../../../core/models/book.model';

export interface BooksState {
    books: Book[];
    isLoading: boolean;
    error: string;
    isAdding: boolean;
}

export const initialState: BooksState = {
    books: [],
    isLoading: false,
    error: '',
    isAdding: false
};

export const booksReducer = createReducer(
    initialState,
    on(BooksActions.loadBooks, state => ({
        ...state,
        isLoading: true,
        error: ''
    })),
    on(BooksActions.loadBooksSuccess, (state, { books }) => ({
        ...state,
        books,
        isLoading: false
    })),
    on(BooksActions.loadBooksFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BooksActions.addBook, state => ({
        ...state,
        isAdding: true,
        error: ''
    })),
    on(BooksActions.addBookSuccess, (state) => ({
        ...state,
        isAdding: false,
    })),
    on(BooksActions.addBookFailure, (state, { error }) => ({
        ...state,
        isAdding: false,
        error
    }))
);
