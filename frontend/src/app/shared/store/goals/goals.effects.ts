import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as GoalsActions from './goals.actions';
import * as UiActions from '../ui/ui.actions';
import { GoalService } from '../../../core/services/goal.service';

@Injectable()
export class GoalsEffects {
  private readonly actions$ = inject(Actions);
  private readonly goalService = inject(GoalService);

  loadGoals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.loadGoals),
      switchMap(() =>
        this.goalService.getGoals().pipe(
          map(goals => GoalsActions.loadGoalsSuccess({ goals })),
          catchError(error => of(GoalsActions.loadGoalsFailure({ error: error.message })))
        )
      )
    )
  );

  loadArchivedGoals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.loadArchivedGoals),
      switchMap(() =>
        this.goalService.getArchivedGoals().pipe(
          map(goals => GoalsActions.loadArchivedGoalsSuccess({ goals })),
          catchError(error => of(GoalsActions.loadArchivedGoalsFailure({ error: error.message })))
        )
      )
    )
  );

  createGoal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.createGoal),
      switchMap(({ goal }) =>
        this.goalService.createGoal(goal).pipe(
          map(created => GoalsActions.createGoalSuccess({ goal: created })),
          catchError(error => of(GoalsActions.createGoalFailure({ error: error.message })))
        )
      )
    )
  );

  createGoalSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.createGoalSuccess),
      map(() => UiActions.showToast({
        toastType: UiActions.ToastType.Success,
        messageKey: 'TOAST.SUCCESS_GOAL_CREATE',
      }))
    )
  );

  createGoalFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.createGoalFailure),
      map(() => UiActions.showToast({
        toastType: UiActions.ToastType.Error,
        messageKey: 'TOAST.ERROR_GOAL_CREATE',
      }))
    )
  );

  deleteGoal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.deleteGoal),
      switchMap(({ id }) =>
        this.goalService.deleteGoal(id).pipe(
          map(() => GoalsActions.deleteGoalSuccess({ id })),
          catchError(error => of(GoalsActions.deleteGoalFailure({ error: error.message })))
        )
      )
    )
  );

  toggleGoalActive$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.toggleGoalActive),
      switchMap(({ id }) =>
        this.goalService.toggleGoalActive(id).pipe(
          map(goal => GoalsActions.toggleGoalActiveSuccess({ goal })),
          catchError(error => of(GoalsActions.toggleGoalActiveFailure({ error: error.message })))
        )
      )
    )
  );

  toggleGoalActiveSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GoalsActions.toggleGoalActiveSuccess),
      map(({ goal }) => UiActions.showToast({
        toastType: UiActions.ToastType.Info,
        messageKey: goal.isActive
          ? 'TOAST.GOAL_REACTIVATED'
          : 'TOAST.GOAL_DEACTIVATED',
      }))
    )
  );
}
