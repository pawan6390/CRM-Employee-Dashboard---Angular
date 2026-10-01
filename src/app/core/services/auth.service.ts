import { Injectable, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, delay, of, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "../models/auth.model";
import { ApiResponse } from "../models/api-response.model";
import { User, UserRole } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _currentUser = signal<User | null>(this.readStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === "ADMIN");

  private readStoredUser(): User | null {
    const raw = localStorage.getItem("crm_current_user");
    return raw ? (JSON.parse(raw) as User) : null;
  }

  login(payload: LoginPayload): Observable<ApiResponse<LoginResponse>> {
    if (!payload.email || !payload.password || payload.password.length < 6) {
      return throwError(() => ({
        error: { message: "Please enter a valid email and password." },
      })) as Observable<ApiResponse<LoginResponse>>;
    }

    const response: ApiResponse<LoginResponse> = {
      success: true,
      message: "Login successful",
      data: {
        accessToken: `demo-access-token-${Date.now()}`,
        refreshToken: `demo-refresh-token-${Date.now()}`,
        user: this.createDemoUser(payload.email),
      },
    };

    return of(response).pipe(delay(400), this.persistSessionOperator());
  }

  register(payload: RegisterPayload): Observable<ApiResponse<LoginResponse>> {
    const response: ApiResponse<LoginResponse> = {
      success: true,
      message: "Account created successfully",
      data: {
        accessToken: `demo-access-token-${Date.now()}`,
        refreshToken: `demo-refresh-token-${Date.now()}`,
        user: this.createDemoUser(payload.email),
      },
    };

    return of(response).pipe(delay(400), this.persistSessionOperator());
  }

  forgotPassword(
    payload: ForgotPasswordPayload,
  ): Observable<ApiResponse<{ sent: boolean }>> {
    const response: ApiResponse<{ sent: boolean }> = {
      success: true,
      message: "If the email exists, a reset link has been sent.",
      data: { sent: true },
    };

    return of(response);
  }

  resetPassword(
    payload: ResetPasswordPayload,
  ): Observable<ApiResponse<{ reset: boolean }>> {
    const response: ApiResponse<{ reset: boolean }> = {
      success: true,
      message: "Password reset successful",
      data: { reset: true },
    };

    return of(response);
  }

  changePassword(
    payload: ChangePasswordPayload,
  ): Observable<ApiResponse<{ updated: boolean }>> {
    const response: ApiResponse<{ updated: boolean }> = {
      success: true,
      message: "Password updated successfully",
      data: { updated: true },
    };

    return of(response);
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem("crm_current_user");
    this._currentUser.set(null);
    this.router.navigate(["/auth/login"]);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  updateCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem("crm_current_user", JSON.stringify(user));
  }

  private createDemoUser(email: string): User {
    const normalizedEmail = email.trim().toLowerCase();
    const role = normalizedEmail.includes("admin")
      ? UserRole.Admin
      : normalizedEmail.includes("manager")
        ? UserRole.Manager
        : UserRole.Employee;

    return {
      id: Date.now(),
      name: normalizedEmail.split("@")[0].replace(/[._-]/g, " "),
      email: normalizedEmail,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  private persistSessionOperator<T extends { data: LoginResponse }>() {
    return (source: Observable<T>) =>
      source.pipe(
        delay(0),
        (obs) =>
          new Observable<T>((subscriber) => {
            const subscription = obs.subscribe({
              next: (value) => {
                this.persistSession(value.data);
                subscriber.next(value);
              },
              error: (error) => subscriber.error(error),
              complete: () => subscriber.complete(),
            });

            return () => subscription.unsubscribe();
          }),
      );
  }

  private persistSession(data: LoginResponse): void {
    localStorage.setItem(environment.tokenKey, data.accessToken);
    localStorage.setItem(environment.refreshTokenKey, data.refreshToken);
    localStorage.setItem("crm_current_user", JSON.stringify(data.user));
    this._currentUser.set(data.user);
  }
}
