import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as BooksActions from './books.actions';
import { BooksService } from '../../../core/services/books.service';

@Injectable()
export class BooksEffects {
    private readonly actions$ = inject(Actions);
    private readonly booksService = inject(BooksService);

    loadBooks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.loadBooks),
            switchMap(({ filters }) =>
                this.booksService.getUserBooks(filters).pipe(
                    map(books => BooksActions.loadBooksSuccess({ books })),
                    catchError(error => of(BooksActions.loadBooksFailure({ error })))
                )
            )
        )
    );

    addBook$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.addBook),
            exhaustMap(({ book }) =>
                this.booksService.addExternalBook(book).pipe(
                    switchMap(externalBook =>
                        this.booksService.addUserBook(externalBook.id).pipe(
                            map(newBook => BooksActions.addBookSuccess({ book: newBook }))
                        )
                    ),
                    catchError(error => of(BooksActions.addBookFailure({ error })))
                )
            )
        )
    );

    addBookSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.addBookSuccess),
            map(() => BooksActions.loadBooks({}))
        )
    );

    deleteBook$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.deleteBook),
            switchMap(({ id }) =>
                this.booksService.deleteUserBook(id).pipe(
                    map(() => BooksActions.deleteBookSuccess({ id })),
                    catchError(error => of(BooksActions.deleteBookFailure({ error: error.message })))
                )
            )
        )
    );

    deleteBookSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.deleteBookSuccess),
            map(() => BooksActions.loadBooks({}))
        )
    );

    loadBook$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.loadBook),
            switchMap(({ id }) =>
                this.booksService.getBookById(id).pipe(
                    map(book => BooksActions.loadBookSuccess({ book })),
                    catchError(error => of(BooksActions.loadBookFailure({ error: error.message })))
                )
            )
        )
    );

    updateBook$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateBook),
            switchMap(({ id, updates }) =>
                this.booksService.updateBook(id, updates).pipe(
                    map(book => BooksActions.updateBookSuccess({ book })),
                    catchError(error => of(BooksActions.updateBookFailure({ error: error.message })))
                )
            )
        )
    );

    loadLatestNote$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.loadLatestNote),
            switchMap(() =>
                this.booksService.getLatestNote().pipe(
                    map(note => BooksActions.loadLatestNoteSuccess({ note })),
                    catchError(error => of(BooksActions.loadLatestNoteFailure({ error: error.message })))
                )
            )
        )
    );

    refreshLatestNote$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateBookSuccess, BooksActions.addBookSuccess, BooksActions.deleteBookSuccess),
            map(() => BooksActions.loadLatestNote())
        )
    );
}
