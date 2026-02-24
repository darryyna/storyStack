import { createReducer, on } from '@ngrx/store';
import * as BooksActions from './books.actions';
import { Book } from '../../../core/models/book.model';

export interface BooksState {
    books: Book[];
    selectedBook: Book | null;
    latestNote: { bookId: string; bookTitle: string; lastNote: string; timestamp: string } | null;
    isLoading: boolean;
    error: string;
    isAdding: boolean;
}

export const initialState: BooksState = {
    books: [],
    selectedBook: null,
    latestNote: null,
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
        isLoading: true,
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
    on(BooksActions.addBookSuccess, (state) => ({
        ...state,
        isAdding: false,
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
    on(BooksActions.deleteBookSuccess, (state, { id }) => ({
        ...state,
        books: state.books.filter(b => b.id !== id),
        selectedBook: state.selectedBook?.id === id ? null : state.selectedBook,
        isLoading: false
    })),
    on(BooksActions.deleteBookFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    }))
);
