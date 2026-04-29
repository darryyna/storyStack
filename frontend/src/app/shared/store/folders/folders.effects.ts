import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as FoldersActions from './folders.actions';
import { FoldersService } from '../../../core/services/folders.service';
import * as UiActions from '../ui/ui.actions';
import * as BooksActions from '../books/books.actions';

@Injectable()
export class FoldersEffects {
    private readonly actions$ = inject(Actions);
    private readonly foldersService = inject(FoldersService);

    loadFolders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.loadFolders),
            switchMap(() =>
                this.foldersService.getFolders().pipe(
                    map(folders => FoldersActions.loadFoldersSuccess({ folders })),
                    catchError(error => of(FoldersActions.loadFoldersFailure({ error: error.message })))
                )
            )
        )
    );

    createFolder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.createFolder),
            switchMap(({ folder }) =>
                this.foldersService.createFolder(folder).pipe(
                    map(newFolder => FoldersActions.createFolderSuccess({ folder: newFolder })),
                    catchError(error => of(FoldersActions.createFolderFailure({ error: error.message })))
                )
            )
        )
    );

    createFolderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.createFolderSuccess),
            switchMap(() => [
                UiActions.showToast({
                    toastType: UiActions.ToastType.Success,
                    messageKey: 'TOAST.SUCCESS_FOLDER_CREATE'
                }),
                BooksActions.loadBooks({ filters: { page: 1, limit: 10 } }) // Refresh books to show folder updates
            ])
        )
    );

    createFolderFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.createFolderFailure),
            map(() => UiActions.showToast({
                toastType: UiActions.ToastType.Error,
                messageKey: 'TOAST.ERROR_FOLDER_CREATE'
            }))
        )
    );

    addBooksToFolder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.addBooksToFolder),
            switchMap(({ folderId, bookIds }) =>
                this.foldersService.addBooksToFolder(folderId, bookIds).pipe(
                    map(() => FoldersActions.addBooksToFolderSuccess()),
                    catchError(error => of(FoldersActions.addBooksToFolderFailure({ error: error.message })))
                )
            )
        )
    );

    addBooksToFolderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.addBooksToFolderSuccess),
            switchMap(() => [
                UiActions.showToast({
                    toastType: UiActions.ToastType.Success,
                    messageKey: 'TOAST.SUCCESS_ADD_TO_FOLDER'
                }),
                BooksActions.loadBooks({ filters: { page: 1, limit: 10 } })
            ])
        )
    );

    addBooksToFolderFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.addBooksToFolderFailure),
            map(() => UiActions.showToast({
                toastType: UiActions.ToastType.Error,
                messageKey: 'TOAST.ERROR_FOLDER_CREATE'
            }))
        )
    );

    deleteFolder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.deleteFolder),
            switchMap(({ id }) =>
                this.foldersService.deleteFolder(id).pipe(
                    map(() => FoldersActions.deleteFolderSuccess({ id })),
                    catchError(error => of(FoldersActions.deleteFolderFailure({ error: error.message })))
                )
            )
        )
    );

    deleteFolderSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.deleteFolderSuccess),
            switchMap(() => [
                UiActions.showToast({
                    toastType: UiActions.ToastType.Success,
                    messageKey: 'TOAST.SUCCESS_FOLDER_DELETE'
                }),
                BooksActions.loadBooks({ filters: { page: 1, limit: 10 } })
            ])
        )
    );

    deleteFolderFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FoldersActions.deleteFolderFailure),
            map(() => UiActions.showToast({
                toastType: UiActions.ToastType.Error,
                messageKey: 'TOAST.ERROR_FOLDER_DELETE'
            }))
        )
    );
}
