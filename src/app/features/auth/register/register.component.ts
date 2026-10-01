import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ["", [Validators.required, CustomValidators.notBlank()]],
      email: ["", [Validators.required, CustomValidators.email()]],
      password: ["", [Validators.required, CustomValidators.strongPassword()]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: CustomValidators.matchFields("password", "confirmPassword") },
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService
      .register(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success("Account created! Welcome aboard.");
          this.router.navigateByUrl("/dashboard");
        },
      });
  }
}
