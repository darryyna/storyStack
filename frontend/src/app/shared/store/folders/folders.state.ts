import { Folder } from '../../../core/models/folder.model';

export interface FoldersState {
    folders: Folder[];
    loading: boolean;
    error: string | null;
}

export const initialFoldersState: FoldersState = {
    folders: [],
    loading: false,
    error: null
};
