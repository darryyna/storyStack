import { Component, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  private readonly store = inject(Store);

  isAuthenticated = toSignal(this.store.pipe(select(selectIsAuthenticated)), { initialValue: false });

  protected readonly advantagesItems = ['PARAGRAPHS.ADVANTAGES-1', 'PARAGRAPHS.ADVANTAGES-2', 'PARAGRAPHS.ADVANTAGES-3'] as const;
}
