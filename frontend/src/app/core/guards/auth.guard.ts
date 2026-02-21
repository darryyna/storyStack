import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, filter, take, switchMap } from 'rxjs';
import { selectIsAuthenticated, selectIsAuthLoading } from '../../shared/store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthLoading).pipe(
    filter(isLoading => !isLoading),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
