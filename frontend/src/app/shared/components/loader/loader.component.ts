import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, delay, map, Observable, Subject, takeUntil } from 'rxjs';
import { AuthState } from '../../store/registration.state';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit, OnDestroy {

  @Select(AuthState.isAuthLoading)
  public isAuthStateLoading$!: Observable<boolean>;

  public isAppLoading$!: Observable<boolean>;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public ngOnInit(): void {
    this.isAppLoading$ = combineLatest([
      this.isAuthStateLoading$
    ]).pipe(delay(0),
      map((isLoading: boolean[]) => isLoading.some(Boolean)),
      takeUntil(this.destroy$)
    )
  }

  public ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
