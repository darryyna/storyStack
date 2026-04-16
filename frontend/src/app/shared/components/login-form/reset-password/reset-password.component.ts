import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../validators/password-match.validator';
import { TranslatePipe } from '@ngx-translate/core';
import { FormErrorComponent } from '../../form-error/form-error.component';

@Component({
  selector: 'app-reset-password',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    FormErrorComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);
  private token = '';

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) this.router.navigate(['/login']);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.authService.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.error || 'AUTH.RESET_ERROR');
      }
    });
  }
}
