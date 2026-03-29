import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { selectToast } from '../../store/ui/ui.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastType } from '../../store/ui/ui.actions';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent {
  private readonly store = inject(Store);
  protected readonly toast = toSignal(this.store.select(selectToast));

  protected getIcon(type: ToastType): string {
    switch (type) {
      case ToastType.Success: return 'check_circle';
      case ToastType.Error: return 'error';
      case ToastType.Warning: return 'warning';
      case ToastType.Info: return 'info';
      default: return 'info';
    }
  }
}
