import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../../validators/password-match.validator';
import { TranslatePipe } from '@ngx-translate/core';
import { FormErrorComponent } from '../../form-error/form-error.component';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectResetPassword } from '../../../store/auth/auth.selectors';
import { resetPassword } from '../../../store/auth/auth.actions';

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
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly resetPasswordState = toSignal(
    this.store.select(selectResetPassword),
    { initialValue: { isLoading: false, success: false, error: null } }
  );

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
    this.store.dispatch(resetPassword({
      token: this.token,
      newPassword: this.form.getRawValue().password
    }));
  }
}
