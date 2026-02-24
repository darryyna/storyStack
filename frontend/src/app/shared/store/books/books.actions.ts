import { createAction, props } from '@ngrx/store';
import { Book, GoogleBook, BookFilters } from '../../../core/models/book.model';

export const loadBooks = createAction(
    '[Books] Load Books',
    props<{ filters?: BookFilters }>()
);

export const loadBooksSuccess = createAction(
    '[Books] Load Books Success',
    props<{ books: Book[] }>()
);

export const loadBooksFailure = createAction(
    '[Books] Load Books Failure',
    props<{ error: string }>()
);

export const addBook = createAction(
    '[Books] Add Book',
    props<{ book: GoogleBook }>()
);

export const addBookSuccess = createAction(
    '[Books] Add Book Success',
    props<{ book: Book }>()
);

export const addBookFailure = createAction(
    '[Books] Add Book Failure',
    props<{ error: string }>()
);

export const deleteBook = createAction(
    '[Books] Delete Book',
    props<{ id: string }>()
);

export const deleteBookSuccess = createAction(
    '[Books] Delete Book Success',
    props<{ id: string }>()
);

export const deleteBookFailure = createAction(
    '[Books] Delete Book Failure',
    props<{ error: string }>()
);

export const loadBook = createAction(
    '[Books] Load Book',
    props<{ id: string }>()
);

export const loadBookSuccess = createAction(
    '[Books] Load Book Success',
    props<{ book: Book }>()
);

export const loadBookFailure = createAction(
    '[Books] Load Book Failure',
    props<{ error: string }>()
);

export const loadLatestNote = createAction(
    '[Books] Load Latest Note'
);

export const loadLatestNoteSuccess = createAction(
    '[Books] Load Latest Note Success',
    props<{ note: { bookId: string; bookTitle: string; lastNote: string; timestamp: string } }>()
);

export const loadLatestNoteFailure = createAction(
    '[Books] Load Latest Note Failure',
    props<{ error: string }>()
);

export const updateBook = createAction(
    '[Books] Update Book',
    props<{ id: string; updates: Partial<Book> }>()
);

export const updateBookSuccess = createAction(
    '[Books] Update Book Success',
    props<{ book: Book }>()
);

export const updateBookFailure = createAction(
    '[Books] Update Book Failure',
    props<{ error: string }>()
);
