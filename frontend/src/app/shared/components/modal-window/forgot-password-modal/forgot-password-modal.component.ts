import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormErrorComponent } from '../../form-error/form-error.component';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, FormErrorComponent],
  templateUrl: './forgot-password-modal.component.html',
  styleUrl: './forgot-password-modal.component.scss',
})
export class ForgotPasswordModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ForgotPasswordModalComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('AUTH.FORGOT_PASSWORD_ERROR');
      }
    });
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
