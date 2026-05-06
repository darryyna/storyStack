import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { GoalPrediction } from '../../shared/models/prediction.model';
import { Goal } from '../../shared/models/goal.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoalService } from '../../core/services/goal.service';
import * as GoalsActions from '../../shared/store/goals/goals.actions';
import {
  selectAchievedGoals,
  selectArchivedGoals, selectArchivedGoalsLoading, selectGoalsLoading,
  selectInProgressGoals,
} from '../../shared/store/goals/goals.selector';


@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, TranslateModule, LoaderComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly goalService = inject(GoalService);

  protected readonly inProgressGoals = toSignal(this.store.select(selectInProgressGoals), { initialValue: [] });
  protected readonly achievedGoals = toSignal(this.store.select(selectAchievedGoals), { initialValue: [] });
  protected readonly archivedGoals = toSignal(this.store.select(selectArchivedGoals), { initialValue: [] });
  protected readonly isLoading = toSignal(this.store.select(selectGoalsLoading), { initialValue: false });
  protected readonly isArchivedLoading = toSignal(this.store.select(selectArchivedGoalsLoading), { initialValue: false });

  protected readonly isCreating = signal(false);
  protected readonly showArchived = signal(false);

  protected predictions = signal<Record<string, {
    data: GoalPrediction | null;
    isLoading: boolean;
    isLoaded: boolean;
    error: boolean;
  }>>({});

  protected readonly goalForm = this.fb.group({
    name: ['', [Validators.required]],
    type: ['MONTH' as Goal['type'], [Validators.required]],
    goalType: ['BOOKS_COUNT' as Goal['goalType'], [Validators.required]],
    targetCount: [1, [Validators.required, Validators.min(1)]],
    category: ['']
  });

  ngOnInit(): void {
    this.store.dispatch(GoalsActions.loadGoals());
  }

  protected toggleArchived(): void {
    this.showArchived.update(v => !v);
    // lazy-load archived goals only when first opened
    if (this.showArchived() && this.archivedGoals().length === 0) {
      this.store.dispatch(GoalsActions.loadArchivedGoals());
    }
  }

  protected loadPrediction(goalId: string): void {
    const current = this.predictions()[goalId];
    if (current?.isLoaded || current?.isLoading) return;

    this.predictions.update(p => ({
      ...p,
      [goalId]: { data: null, isLoading: true, isLoaded: false, error: false }
    }));

    this.goalService.getGoalPrediction(goalId).subscribe({
      next: (res) => {
        this.predictions.update(p => ({
          ...p,
          [goalId]: { data: res.prediction, isLoading: false, isLoaded: true, error: false }
        }));
      },
      error: () => {
        this.predictions.update(p => ({
          ...p,
          [goalId]: { data: null, isLoading: false, isLoaded: false, error: true }
        }));
      }
    });
  }

  protected getPrediction(goalId: string) {
    return this.predictions()[goalId] ?? null;
  }

  protected onSubmit(): void {
    if (this.goalForm.invalid) return;

    const formValue = this.goalForm.value;
    const startDate = new Date();
    const endDate = new Date();

    switch (formValue.type) {
        case 'MONTH': endDate.setMonth(endDate.getMonth() + 1); break;
        case 'QUARTER': endDate.setMonth(endDate.getMonth() + 3); break;
        case 'HALF_YEAR': endDate.setMonth(endDate.getMonth() + 6); break;
        case 'YEAR': endDate.setFullYear(endDate.getFullYear() + 1); break;
    }

    const newGoal: Goal = {
      name: formValue.name!,
      type: formValue.type as Goal['type'],
      goalType: formValue.goalType as Goal['goalType'],
      targetCount: formValue.targetCount!,
      startDate,
      endDate,
      category: formValue.category || undefined
    };

    this.store.dispatch(GoalsActions.createGoal({ goal: newGoal }));
    this.isCreating.set(false);
    this.goalForm.reset({ type: 'MONTH', goalType: 'BOOKS_COUNT', targetCount: 1 });
  }

  protected deactivateGoal(id: string): void {
    this.store.dispatch(GoalsActions.toggleGoalActive({ id }));
  }

  protected reactivateGoal(id: string): void {
    this.store.dispatch(GoalsActions.toggleGoalActive({ id }));
  }

  protected deleteGoal(id: string): void {
    if (confirm('Permanently delete this goal? This cannot be undone.')) {
      this.store.dispatch(GoalsActions.deleteGoal({ id }));
    }
  }

  protected toggleCreate(): void {
    this.isCreating.set(!this.isCreating());
  }
}
