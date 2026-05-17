import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}
