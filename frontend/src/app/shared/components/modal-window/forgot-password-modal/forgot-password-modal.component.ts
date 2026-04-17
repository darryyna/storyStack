import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormErrorComponent } from '../../form-error/form-error.component';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectForgotPassword } from '../../../store/auth/auth.selectors';
import { forgotPassword } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, FormErrorComponent],
  templateUrl: './forgot-password-modal.component.html',
  styleUrl: './forgot-password-modal.component.scss',
})
export class ForgotPasswordModalComponent {
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<ForgotPasswordModalComponent>);
  private readonly fb = inject(FormBuilder);

  protected readonly forgotPasswordState = toSignal(
    this.store.select(selectForgotPassword),
    { initialValue: { isLoading: false, submitted: false, error: null } }
  );

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.store.dispatch(forgotPassword({ email: this.form.getRawValue().email }));
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
