import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GoalsState } from './goals.state';

export const selectGoalsState = createFeatureSelector<GoalsState>('goals');

export const selectActiveGoals = createSelector(
  selectGoalsState,
  state => state.activeGoals
);

export const selectArchivedGoals = createSelector(
  selectGoalsState,
  state => state.archivedGoals
);

export const selectGoalsLoading = createSelector(
  selectGoalsState,
  state => state.isLoading
);

export const selectArchivedGoalsLoading = createSelector(
  selectGoalsState,
  state => state.isArchivedLoading
);

// in-progress goals (active, not yet achieved)
export const selectInProgressGoals = createSelector(
  selectActiveGoals,
  goals => goals.filter(g => !g.isAchieved)
);

// achieved goals (still active/not deactivated)
export const selectAchievedGoals = createSelector(
  selectActiveGoals,
  goals => goals.filter(g => g.isAchieved)
);
