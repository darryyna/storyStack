import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { selectIsAuthenticated, selectIsAuthLoading } from '../../store/auth/auth.selectors';
import { loginUser, registerUser } from '../../store/auth/auth.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, MatCheckboxModule, MatButtonModule],
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  activeTab = signal<'login' | 'signup'>('login');

  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isAuthenticated = toSignal(this.store.pipe(select(selectIsAuthenticated)), { initialValue: false });
  isAuthStateLoading = toSignal(this.store.pipe(select(selectIsAuthLoading)), { initialValue: false });

  ngOnInit(): void {
    this.initializeForms();
    this.store.pipe(
      select(selectIsAuthenticated),
      filter(Boolean)
    ).subscribe(() => this.router.navigate(['/']));
  }

  setActiveTab(tab: 'login' | 'signup'): void {
    this.activeTab.set(tab);
    this.loginForm.markAsUntouched();
    this.registerForm.markAsUntouched();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.store.dispatch(loginUser({ payload: { username, password } }));
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      this.store.dispatch(registerUser({ payload: { username, email, password } }));
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
