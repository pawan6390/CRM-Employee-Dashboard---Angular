import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { DepartmentService } from "../department.service";
import { User } from "../../../core/models/user.model";
import { ToastService } from "../../../core/services/toast.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-department-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./department-form.component.html",
  styleUrl: "./department-form.component.scss",
})
export class DepartmentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly managers = signal<User[]>([]);
  readonly submitting = signal(false);
  readonly loading = signal(false);

  private readonly departmentId = signal<number | null>(
    this.route.snapshot.paramMap.get("id")
      ? Number(this.route.snapshot.paramMap.get("id"))
      : null,
  );

  readonly isEditMode = computed(() => this.departmentId() !== null);
  readonly pageTitle = computed(() =>
    this.isEditMode() ? "Edit Department" : "Add Department",
  );

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, CustomValidators.notBlank()]],
    code: ["", [Validators.required, Validators.maxLength(10)]],
    managerId: [null as number | null],
  });

  get f() {
    return this.form.controls;
  }

  constructor() {
    this.departmentService
      .getManagersLookup()
      .pipe(takeUntilDestroyed())
      .subscribe((res) => this.managers.set(res.data));

    const id = this.departmentId();
    if (id !== null) {
      this.loading.set(true);
      this.departmentService
        .getById(id)
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(),
        )
        .subscribe({
          next: (res) => {
            const dept = res.data;
            this.form.patchValue({
              name: dept.name,
              code: dept.code,
              managerId: dept.managerId ?? null,
            });
          },
          error: () => this.router.navigateByUrl("/departments"),
        });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload = this.form.getRawValue();
    const id = this.departmentId();

    const request$ =
      id !== null
        ? this.departmentService.update(id, payload)
        : this.departmentService.create(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.toast.success(
          id !== null ? "Department updated." : "Department created.",
        );
        this.router.navigateByUrl("/departments");
      },
    });
  }
}
