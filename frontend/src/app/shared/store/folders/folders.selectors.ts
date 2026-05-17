import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FoldersState } from './folders.state';

export const selectFoldersState = createFeatureSelector<FoldersState>('folders');

export const selectAllFolders = createSelector(
    selectFoldersState,
    (state) => state.folders
);

export const selectFoldersLoading = createSelector(
    selectFoldersState,
    (state) => state.loading
);

export const selectFoldersError = createSelector(
    selectFoldersState,
    (state) => state.error
);
