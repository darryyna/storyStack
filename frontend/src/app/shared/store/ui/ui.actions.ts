import { createAction, props } from '@ngrx/store';

export enum ToastType {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info'
}

export interface ToastParams {
    [key: string]: string | number;
}

export const showToast = createAction(
    '[UI] Show Toast',
    props<{ toastType: ToastType; messageKey: string; params?: ToastParams }>()
);

export const hideToast = createAction('[UI] Hide Toast');
