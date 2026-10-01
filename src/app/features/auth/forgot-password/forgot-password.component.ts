import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "./forgot-password.component.scss",
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly submitting = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, CustomValidators.email()]],
  });

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
      .forgotPassword(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.sent.set(true),
      });
  }
}
