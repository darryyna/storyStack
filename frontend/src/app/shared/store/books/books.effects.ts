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
            switchMap(() =>
                this.booksService.getUserBooks().pipe(
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
                // add external book first to get externalBookId, then add user book
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
            map(() => BooksActions.loadBooks())
        )
    );
}
