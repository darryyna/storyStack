import { Component, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { selectIsAuthLoading } from '../../store/auth/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  private readonly store = inject(Store);

  isAuthStateLoading = toSignal(this.store.pipe(select(selectIsAuthLoading)), { initialValue: true });
}
