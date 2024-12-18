import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';

export const authGuard: CanMatchFn = async (route, segments) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userService = inject(UserService);

  const token = authService.getToken();

  if (!token) {
    notAuthenticated(router);
  }

  try {
    await userService.getCurrentUser();
    const isUserCreated = !!userService.user;
    return isUserCreated ? true : notAuthenticated(router);
  } catch (error) {
    return notAuthenticated(router);
  }
};

const notAuthenticated = (router: Router) => {
  localStorage.clear();
  router.navigate(['/login']);
  return false;
};
