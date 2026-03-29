import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as BooksActions from './books.actions';
import { BooksService } from '../../../core/services/books.service';
import { Book, SearchBook, PaginatedBooksResponse } from '../../../core/models/book.model';

import * as UiActions from '../ui/ui.actions';

@Injectable()
export class BooksEffects {
    private readonly actions$ = inject(Actions);
    private readonly booksService = inject(BooksService);

    loadBooks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.loadBooks),
            switchMap(({ filters }) =>
                this.booksService.getUserBooks(filters).pipe(
                    map(res => {
                        // Backend might not be restarted yet, so handle array vs object response
                        const response: PaginatedBooksResponse = Array.isArray(res) 
                            ? { books: res, totalCount: res.length, currentPage: 1, totalPages: 1 } 
                            : res as PaginatedBooksResponse;
                        return BooksActions.loadBooksSuccess({ response });
                    }),
                    catchError(error => of(BooksActions.loadBooksFailure({ error: error.message || 'Failed to fetch books' })))
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
            switchMap(({ book }) => [
                BooksActions.loadBooks({}),
                UiActions.showToast({ 
                    toastType: UiActions.ToastType.Success, 
                    messageKey: 'TOAST.SUCCESS_ADD', 
                    params: { title: book.bookId?.title || '' } 
                })
            ])
        )
    );

    addBookFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.addBookFailure),
            map(() => UiActions.showToast({ 
                toastType: UiActions.ToastType.Error, 
                messageKey: 'TOAST.ERROR_ADD' 
            }))
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
            switchMap(() => [
                BooksActions.loadBooks({}),
                UiActions.showToast({ 
                    toastType: UiActions.ToastType.Success, 
                    messageKey: 'TOAST.SUCCESS_DELETE' 
                })
            ])
        )
    );

    deleteBookFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.deleteBookFailure),
            map(() => UiActions.showToast({ 
                toastType: UiActions.ToastType.Error, 
                messageKey: 'TOAST.ERROR_DELETE' 
            }))
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

    updateBookSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateBookSuccess),
            map(() => UiActions.showToast({ 
                toastType: UiActions.ToastType.Success, 
                messageKey: 'TOAST.SUCCESS_UPDATE' 
            }))
        )
    );

    updateBookFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateBookFailure),
            map(() => UiActions.showToast({ 
                toastType: UiActions.ToastType.Error, 
                messageKey: 'TOAST.ERROR_UPDATE' 
            }))
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
