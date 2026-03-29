import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectToast = createSelector(
    selectUiState,
    (state: UiState) => state.toast
);
