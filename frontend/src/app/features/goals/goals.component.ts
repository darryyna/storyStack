import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { GoalService, Goal } from '../../core/services/goal.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import * as UiActions from '../../shared/store/ui/ui.actions';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, TranslateModule, LoaderComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  private goalService = inject(GoalService);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  protected goals = signal<Goal[]>([]);
  protected isLoading = signal(true);
  protected isCreating = signal(false);

  protected goalForm = this.fb.group({
    name: ['', [Validators.required]],
    type: ['MONTH' as Goal['type'], [Validators.required]],
    goalType: ['BOOKS_COUNT' as Goal['goalType'], [Validators.required]],
    targetCount: [1, [Validators.required, Validators.min(1)]],
    category: ['']
  });

  ngOnInit(): void {
    this.loadGoals();
  }

  protected loadGoals(): void {
    this.isLoading.set(true);
    this.goalService.getGoals().subscribe({
      next: (data) => {
        this.goals.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  protected onSubmit(): void {
    if (this.goalForm.invalid) return;

    const formValue = this.goalForm.value;
    const startDate = new Date();
    let endDate = new Date();

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

    this.isLoading.set(true);
    this.goalService.createGoal(newGoal).subscribe({
      next: () => {
        this.loadGoals();
        this.isCreating.set(false);
        this.goalForm.reset({ type: 'MONTH', goalType: 'BOOKS_COUNT', targetCount: 1 });
        this.store.dispatch(UiActions.showToast({ 
          toastType: UiActions.ToastType.Success, 
          messageKey: 'TOAST.SUCCESS_GOAL_CREATE' 
        }));
      },
      error: () => {
        this.isLoading.set(false);
        this.store.dispatch(UiActions.showToast({ 
          toastType: UiActions.ToastType.Error, 
          messageKey: 'TOAST.ERROR_GOAL_CREATE' 
        }));
      }
    });
  }

  protected deleteGoal(id: string): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id).subscribe(() => this.loadGoals());
    }
  }

  protected toggleCreate(): void {
    this.isCreating.set(!this.isCreating());
  }
}
