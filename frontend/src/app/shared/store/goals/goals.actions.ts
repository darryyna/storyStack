import { createAction, props } from '@ngrx/store';
import { Goal } from '../../models/goal.model';

// load active goals
export const loadGoals = createAction('[Goals] Load Goals');
export const loadGoalsSuccess = createAction(
  '[Goals] Load Goals Success',
  props<{ goals: Goal[] }>()
);
export const loadGoalsFailure = createAction(
  '[Goals] Load Goals Failure',
  props<{ error: string }>()
);

// load archived (deactivated) goals
export const loadArchivedGoals = createAction('[Goals] Load Archived Goals');
export const loadArchivedGoalsSuccess = createAction(
  '[Goals] Load Archived Goals Success',
  props<{ goals: Goal[] }>()
);
export const loadArchivedGoalsFailure = createAction(
  '[Goals] Load Archived Goals Failure',
  props<{ error: string }>()
);

export const createGoal = createAction(
  '[Goals] Create Goal',
  props<{ goal: Goal }>()
);
export const createGoalSuccess = createAction(
  '[Goals] Create Goal Success',
  props<{ goal: Goal }>()
);
export const createGoalFailure = createAction(
  '[Goals] Create Goal Failure',
  props<{ error: string }>()
);

export const deleteGoal = createAction(
  '[Goals] Delete Goal',
  props<{ id: string }>()
);
export const deleteGoalSuccess = createAction(
  '[Goals] Delete Goal Success',
  props<{ id: string }>()
);
export const deleteGoalFailure = createAction(
  '[Goals] Delete Goal Failure',
  props<{ error: string }>()
);

export const toggleGoalActive = createAction(
  '[Goals] Toggle Goal Active',
  props<{ id: string }>()
);
export const toggleGoalActiveSuccess = createAction(
  '[Goals] Toggle Goal Active Success',
  props<{ goal: Goal }>()
);
export const toggleGoalActiveFailure = createAction(
  '[Goals] Toggle Goal Active Failure',
  props<{ error: string }>()
);
