import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          toast.error("Your session has expired. Please sign in again.");
          authService.logout();
          break;
        case 403:
          router.navigate(["/unauthorized"]);
          break;
        case 0:
          toast.error("Cannot reach the server. Check your connection.");
          break;
        default:
          toast.error(
            error.error?.message ?? "Something went wrong. Please try again.",
          );
      }
      return throwError(() => error);
    }),
  );
};
