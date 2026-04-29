import { createReducer, on } from '@ngrx/store';
import { initialFoldersState } from './folders.state';
import * as FoldersActions from './folders.actions';

export const foldersReducer = createReducer(
    initialFoldersState,
    on(FoldersActions.loadFolders, (state) => ({ ...state, loading: true })),
    on(FoldersActions.loadFoldersSuccess, (state, { folders }) => ({ ...state, folders, loading: false })),
    on(FoldersActions.loadFoldersFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(FoldersActions.createFolder, (state) => ({ ...state, loading: true })),
    on(FoldersActions.createFolderSuccess, (state, { folder }) => ({ 
        ...state, 
        folders: [...state.folders, folder], 
        loading: false 
    })),
    on(FoldersActions.createFolderFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(FoldersActions.updateFolder, (state) => ({ ...state, loading: true })),
    on(FoldersActions.updateFolderSuccess, (state, { folder }) => ({
        ...state,
        folders: state.folders.map(f => f.id === folder.id ? folder : f),
        loading: false
    })),
    on(FoldersActions.updateFolderFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(FoldersActions.deleteFolder, (state) => ({ ...state, loading: true })),
    on(FoldersActions.deleteFolderSuccess, (state, { id }) => ({
        ...state,
        folders: state.folders.filter(f => f.id !== id),
        loading: false
    })),
    on(FoldersActions.deleteFolderFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(FoldersActions.addBooksToFolder, (state) => ({ ...state, loading: true })),
    on(FoldersActions.addBooksToFolderSuccess, (state) => ({ ...state, loading: false })),
    on(FoldersActions.addBooksToFolderFailure, (state, { error }) => ({ ...state, error, loading: false }))
);
