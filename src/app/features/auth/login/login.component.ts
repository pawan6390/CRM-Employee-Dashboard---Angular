import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";

import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, CustomValidators.email()]],
    password: ["", Validators.required],
    rememberMe: false,
  });

  get f() {
    return this.form.controls;
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.submitting.set(true);

    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success("Welcome back!");

          const returnUrl =
            this.route.snapshot.queryParamMap.get("returnUrl") ?? "/dashboard";

          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          const message =
            error?.error?.message ?? error?.message ?? "Login failed";
          this.toast.error(message);
        },
      });
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }
}
