import { inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { selectIsAuthenticated } from '../../shared/store/auth/auth.selectors';

export const authGuard: CanActivate = async () => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = await firstValueFrom(store.select(selectIsAuthenticated));

  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
