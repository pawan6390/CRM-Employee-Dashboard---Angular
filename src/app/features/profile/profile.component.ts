import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { CustomValidators } from "../../shared/validators/custom-validators";
import { ProfileService } from "./profile.service";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly toast = inject(ToastService);

  readonly currentUser = this.authService.currentUser;

  readonly profileSubmitting = signal(false);
  readonly passwordSubmitting = signal(false);
  readonly avatarUploading = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    name: [
      this.currentUser()?.name ?? "",
      [Validators.required, CustomValidators.notBlank()],
    ],
    email: [
      this.currentUser()?.email ?? "",
      [Validators.required, CustomValidators.email()],
    ],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ["", [Validators.required]],
      newPassword: [
        "",
        [Validators.required, CustomValidators.strongPassword()],
      ],
      confirmPassword: ["", [Validators.required]],
    },
    {
      validators: CustomValidators.matchFields(
        "newPassword",
        "confirmPassword",
      ),
    },
  );

  get pf() {
    return this.profileForm.controls;
  }

  get cf() {
    return this.passwordForm.controls;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSubmitting.set(true);
    this.profileService
      .updateProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => this.profileSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.authService.updateCurrentUser(res.data);
          this.toast.success("Profile updated successfully.");
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSubmitting.set(true);
    this.authService
      .changePassword(this.passwordForm.getRawValue())
      .pipe(finalize(() => this.passwordSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success("Password changed successfully.");
          this.passwordForm.reset();
        },
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.avatarUploading.set(true);
    this.profileService
      .uploadAvatar(file)
      .pipe(finalize(() => this.avatarUploading.set(false)))
      .subscribe({
        next: (res) => {
          const user = this.currentUser();
          if (user) {
            this.authService.updateCurrentUser({
              ...user,
              avatarUrl: res.data.avatarUrl,
            });
          }
          this.toast.success("Profile photo updated.");
        },
      });
  }
}
