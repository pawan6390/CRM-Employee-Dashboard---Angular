import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { UserService } from "../user.service";
import { UserRole } from "../../../core/models/user.model";
import { ToastService } from "../../../core/services/toast.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./user-form.component.html",
  styleUrl: "./user-form.component.scss",
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly UserRole = UserRole;
  readonly submitting = signal(false);
  readonly loading = signal(false);

  private readonly userId = signal<number | null>(
    this.route.snapshot.paramMap.get("id")
      ? Number(this.route.snapshot.paramMap.get("id"))
      : null,
  );

  readonly isEditMode = computed(() => this.userId() !== null);
  readonly pageTitle = computed(() =>
    this.isEditMode() ? "Edit User" : "Add User",
  );

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, CustomValidators.notBlank()]],
    email: ["", [Validators.required, CustomValidators.email()]],
    password: [
      "",
      this.isEditMode()
        ? []
        : [Validators.required, CustomValidators.strongPassword()],
    ],
    role: [UserRole.Employee, [Validators.required]],
    isActive: [true],
  });

  get f() {
    return this.form.controls;
  }

  constructor() {
    const id = this.userId();
    if (id !== null) {
      this.form.controls.password.disable();
      this.loading.set(true);
      this.userService
        .getById(id)
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(),
        )
        .subscribe({
          next: (res) => {
            const user = res.data;
            this.form.patchValue({
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            });
          },
          error: () => this.router.navigateByUrl("/users"),
        });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const id = this.userId();
    const { name, email, password, role, isActive } = this.form.getRawValue();

    const request$ =
      id !== null
        ? this.userService.update(id, { name, email, role, isActive })
        : this.userService.create({ name, email, password, role });

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.toast.success(id !== null ? "User updated." : "User created.");
        this.router.navigateByUrl("/users");
      },
    });
  }
}
