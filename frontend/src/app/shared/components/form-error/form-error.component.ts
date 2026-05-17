import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl } from '@angular/forms';
import { ERROR_TRANSLATION_KEYS } from '../../helpers/errors-types';

@Component({
  selector: 'app-form-error',
  imports: [],
  standalone: true,
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss'
})
export class FormErrorComponent {
  private readonly translate = inject(TranslateService);
  private readonly lang = toSignal(this.translate.onLangChange);

  readonly control = input<AbstractControl | null>(null);
  readonly serverError = input<string | null>(null);

  private readonly changeSignal = signal(0);

  constructor() {
    effect((onCleanup) => {
      const controlToValidate = this.control();
      if (!controlToValidate) return;

      const subscription = controlToValidate.events.subscribe(() => {
        this.changeSignal.update(value => value + 1);
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected shouldShow = computed(() => {
    this.changeSignal();
    if (this.serverError()) return true;
    const controlToShowError = this.control();
    return !!controlToShowError && controlToShowError.invalid && (controlToShowError.touched || controlToShowError.dirty);
  });

  protected errorMessage = computed(() => {
    this.changeSignal();
    this.lang();
    if (this.serverError()) return this.translate.instant(this.serverError()!);
    const controlToValidate = this.control();
    if (!controlToValidate?.errors) return '';

    const firstError = Object.keys(controlToValidate.errors)[0];
    const translationKey = ERROR_TRANSLATION_KEYS[firstError];

    if (!translationKey) return '';

    if (firstError === 'minlength') {
      return this.translate.instant(translationKey, {
        requiredLength: controlToValidate.errors['minlength'].requiredLength
      });
    }

    return this.translate.instant(translationKey);
  });
}
