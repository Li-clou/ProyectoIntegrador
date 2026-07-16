import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map(() => true), // el backend confirmo que la cookie es valida -> deja pasar
    catchError(() => {
      // 401 (o cualquier error) -> no hay sesion valida, manda al login
      router.navigate(['/inicio-sesion']);
      return of(false);
    })
  );
};
