import { createAction, props } from '@ngrx/store';
import { Book, GoogleBook } from '../../../core/models/book.model';

export const loadBooks = createAction('[Books] Load Books');

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
    props<{ book: any }>() // Update type if backend returns specific UserBook
);

export const addBookFailure = createAction(
    '[Books] Add Book Failure',
    props<{ error: any }>()
);
