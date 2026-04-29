import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { mergeMap, of } from 'rxjs';
import * as BooksActions from './books.actions';
import { BooksService } from '../../../core/services/books.service';
import { PaginatedBooksResponse } from '../../../core/models/book.model';

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
            map((response: PaginatedBooksResponse) =>
              BooksActions.loadBooksSuccess({ response })
            ),
            catchError(error =>
              of(BooksActions.loadBooksFailure({
                error: error.message || 'Failed to fetch books'
              }))
            )
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

    updateProgress$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateProgress),
            switchMap(({ id, pagesRead }) =>
                this.booksService.updateReadingProgress(id, pagesRead).pipe(
                    switchMap(response => [
                        BooksActions.updateProgressSuccess({ book: response.userBook }),
                        BooksActions.loadBook({ id })
                    ]),
                    catchError(error => of(BooksActions.updateProgressFailure({ error: error.message })))
                )
            )
        )
    );

    updateProgressSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BooksActions.updateProgressSuccess),
            map(() => UiActions.showToast({
                toastType: UiActions.ToastType.Success,
                messageKey: 'TOAST.SUCCESS_PROGRESS_UPDATE'
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

  loadRecommendations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.loadRecommendations),
      switchMap(() =>
        this.booksService.getRecommendations().pipe(
          map(recommendations => BooksActions.loadRecommendationsSuccess({ recommendations })),
          catchError(error => of(BooksActions.loadRecommendationsFailure({ error: error.message })))
        )
      )
    )
  );

  addBookFromRecommendation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.addBookFromRecommendation),
      mergeMap(({ book }) =>
        this.booksService.addExternalBook(book).pipe(
          switchMap(externalBook =>
            this.booksService.addUserBook(externalBook.id).pipe(
              map(() => BooksActions.addBookFromRecommendationSuccess({
                sourceId: book.id
              }))
            )
          ),
          catchError(error => of(BooksActions.addBookFromRecommendationFailure({
            sourceId: book.id,
            error: error.message
          })))
        )
      )
    )
  );

  addBookFromRecommendationSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.addBookFromRecommendationSuccess),
      switchMap(() => [
        BooksActions.loadBooks({}),
        UiActions.showToast({
          toastType: UiActions.ToastType.Success,
          messageKey: 'TOAST.SUCCESS_ADD_RECOMMENDATION'
        })
      ])
    )
  );
}
