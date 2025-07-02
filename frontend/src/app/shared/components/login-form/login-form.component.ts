import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthState } from '../../store/registration.state';
import { LoginUser, RegisterUser } from '../../store/registration.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: false,
})
export class LoginFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  public loginForm!: FormGroup;
  public registerForm!: FormGroup;
  public activeTab: 'login' | 'signup' = 'login';

  @Select(AuthState.isAuthenticated)
  isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.isLoginLoading)
  isLoginLoading$!: Observable<boolean>;
  @Select(AuthState.isRegisterLoading)
  isRegisterLoading$!: Observable<boolean>;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.loginForm.markAsUntouched();
    this.registerForm.markAsUntouched();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.store.dispatch(new LoginUser({ username, password }))
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.store.selectSnapshot(AuthState.isAuthenticated)) {
            this.router.navigate(['/']);}
        });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      this.store.dispatch(new RegisterUser({ username, email, password }))
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.store.selectSnapshot(AuthState.isAuthenticated)) {
            this.registerForm.reset();
            this.router.navigate(['/']);
          }
        });
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

  private passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
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
