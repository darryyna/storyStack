import { createReducer, on } from '@ngrx/store';
import { initialGoalsState } from './goals.state';
import * as GoalsActions from './goals.actions';

export const goalsReducer = createReducer(
  initialGoalsState,

  // load active
  on(GoalsActions.loadGoals, state => ({ ...state, isLoading: true, error: null })),
  on(GoalsActions.loadGoalsSuccess, (state, { goals }) => ({
    ...state,
    activeGoals: goals,
    isLoading: false,
  })),
  on(GoalsActions.loadGoalsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // load archived
  on(GoalsActions.loadArchivedGoals, state => ({ ...state, isArchivedLoading: true })),
  on(GoalsActions.loadArchivedGoalsSuccess, (state, { goals }) => ({
    ...state,
    archivedGoals: goals,
    isArchivedLoading: false,
  })),
  on(GoalsActions.loadArchivedGoalsFailure, state => ({ ...state, isArchivedLoading: false })),

  on(GoalsActions.createGoal, state => ({ ...state, isLoading: true })),
  on(GoalsActions.createGoalSuccess, (state, { goal }) => ({
    ...state,
    // insert before achieved goals so it appears at top of active list
    activeGoals: [...state.activeGoals, goal].sort((a, b) => {
      if (a.isAchieved === b.isAchieved) return 0;
      return a.isAchieved ? 1 : -1;
    }),
    isLoading: false,
  })),
  on(GoalsActions.createGoalFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(GoalsActions.deleteGoalSuccess, (state, { id }) => ({
    ...state,
    activeGoals: state.activeGoals.filter(g => g.id !== id),
    archivedGoals: state.archivedGoals.filter(g => g.id !== id),
  })),

  on(GoalsActions.toggleGoalActiveSuccess, (state, { goal }) => {
    if (goal.isActive) {
      return {
        ...state,
        archivedGoals: state.archivedGoals.filter(g => g.id !== goal.id),
        activeGoals: [...state.activeGoals, goal].sort((a, b) => {
          if (a.isAchieved === b.isAchieved) return 0;
          return a.isAchieved ? 1 : -1;
        }),
      };
    } else {
      return {
        ...state,
        activeGoals: state.activeGoals.filter(g => g.id !== goal.id),
        archivedGoals: [goal, ...state.archivedGoals],
      };
    }
  }),
);
