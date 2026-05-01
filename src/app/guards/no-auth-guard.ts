import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token';

export const NoAuthGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.getAccessToken()) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};
