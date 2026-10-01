import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { UserRole } from "../models/user.model";
import { AuthService } from "../services/auth.service";

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.currentUser()?.role;
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(["/unauthorized"]);
  };
};
