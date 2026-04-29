import { createAction, props } from '@ngrx/store';
import { Folder } from '../../../core/models/folder.model';

export const loadFolders = createAction('[Folders] Load Folders');
export const loadFoldersSuccess = createAction('[Folders] Load Folders Success', props<{ folders: Folder[] }>());
export const loadFoldersFailure = createAction('[Folders] Load Folders Failure', props<{ error: string }>());

export const createFolder = createAction('[Folders] Create Folder', props<{ folder: Folder }>());
export const createFolderSuccess = createAction('[Folders] Create Folder Success', props<{ folder: Folder }>());
export const createFolderFailure = createAction('[Folders] Create Folder Failure', props<{ error: string }>());

export const updateFolder = createAction('[Folders] Update Folder', props<{ id: string, folder: Folder }>());
export const updateFolderSuccess = createAction('[Folders] Update Folder Success', props<{ folder: Folder }>());
export const updateFolderFailure = createAction('[Folders] Update Folder Failure', props<{ error: string }>());

export const deleteFolder = createAction('[Folders] Delete Folder', props<{ id: string }>());
export const deleteFolderSuccess = createAction('[Folders] Delete Folder Success', props<{ id: string }>());
export const deleteFolderFailure = createAction('[Folders] Delete Folder Failure', props<{ error: string }>());

export const addBooksToFolder = createAction('[Folders] Add Books To Folder', props<{ folderId: string | null, bookIds: string[] }>());
export const addBooksToFolderSuccess = createAction('[Folders] Add Books To Folder Success');
export const addBooksToFolderFailure = createAction('[Folders] Add Books To Folder Failure', props<{ error: string }>());
