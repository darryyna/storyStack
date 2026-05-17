import { createReducer, on } from '@ngrx/store';
import { ToastType, showToast, hideToast, ToastParams } from './ui.actions';

export interface UiState {
    toast: {
        type: ToastType;
        messageKey: string;
        params?: ToastParams;
        visible: boolean;
    } | null;
}

export const initialState: UiState = {
    toast: null
};

export const uiReducer = createReducer(
    initialState,
    on(showToast, (state, { toastType, messageKey, params }) => ({
        ...state,
        toast: {
            type: toastType,
            messageKey,
            params,
            visible: true
        }
    })),
    on(hideToast, (state) => ({
        ...state,
        toast: state.toast ? { ...state.toast, visible: false } : null
    }))
);
