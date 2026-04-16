import { Component, inject, signal, DestroyRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { selectAuthError, selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { clearAuthError, loginUser, registerUser } from '../../store/auth/auth.actions';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { FormErrorComponent } from '../form-error/form-error.component';
import { ForgotPasswordModalComponent } from '../modal-window/forgot-password-modal/forgot-password-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, MatCheckboxModule, MatButtonModule, FormErrorComponent],
})
export class LoginFormComponent {

  protected readonly activeTab = signal<'login' | 'signup'>('login');

  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);

  protected readonly authError = toSignal(
    this.store.pipe(select(selectAuthError))
  );

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly registerForm = this.fb.nonNullable.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    },
    {
      validators: passwordMatchValidator,
    }
  );

  constructor() {
    this.store
      .pipe(
        select(selectIsAuthenticated),
        filter(Boolean),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.router.navigate(['/']));

    this.loginForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.store.dispatch(clearAuthError()));
  }

  protected setActiveTab(tab: 'login' | 'signup'): void {
    this.activeTab.set(tab);
    this.store.dispatch(clearAuthError());
    this.loginForm.markAsUntouched();
    this.registerForm.markAsUntouched();
  }

  protected onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.getRawValue();
      this.store.dispatch(loginUser({ payload: { username, password } }));
      return;
    }
    this.markFormGroupTouched(this.loginForm);
  }

  protected onRegister(): void {
    if (this.registerForm.valid) {
      const { username, email, password } =
        this.registerForm.getRawValue();

      this.store.dispatch(
        registerUser({ payload: { username, email, password } })
      );
      return;
    }

    this.markFormGroupTouched(this.registerForm);
  }

  protected openForgotPassword(): void {
    this.dialog.open(ForgotPasswordModalComponent, { width: '600px' });
  }

  private markFormGroupTouched(
    formGroup: typeof this.loginForm | typeof this.registerForm
  ): void {
    Object.values(formGroup.controls).forEach(control =>
      control.markAsTouched()
    );
  }
}
