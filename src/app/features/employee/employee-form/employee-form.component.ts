import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { EmployeeService } from "../employee.service";
import { EmployeeStatus } from "../../../core/models/employee.model";
import { ToastService } from "../../../core/services/toast.service";
import { CustomValidators } from "../../../shared/validators/custom-validators";

@Component({
  selector: "app-employee-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./employee-form.component.html",
  styleUrl: "./employee-form.component.scss",
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly EmployeeStatus = EmployeeStatus;
  readonly departments = signal<{ id: number; name: string }[]>([]);
  readonly submitting = signal(false);
  readonly loading = signal(false);

  private readonly employeeId = signal<number | null>(
    this.route.snapshot.paramMap.get("id")
      ? Number(this.route.snapshot.paramMap.get("id"))
      : null,
  );

  readonly isEditMode = computed(() => this.employeeId() !== null);
  readonly pageTitle = computed(() =>
    this.isEditMode() ? "Edit Employee" : "Add Employee",
  );

  readonly form = this.fb.nonNullable.group({
    firstName: ["", [Validators.required, CustomValidators.notBlank()]],
    lastName: ["", [Validators.required, CustomValidators.notBlank()]],
    email: ["", [Validators.required, CustomValidators.email()]],
    phone: ["", [Validators.required, CustomValidators.phone()]],
    jobTitle: ["", [Validators.required]],
    departmentId: [null as number | null, [Validators.required]],
    status: [EmployeeStatus.Active, [Validators.required]],
    salary: [0, [Validators.required, Validators.min(0)]],
    hireDate: ["", [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  constructor() {
    this.employeeService
      .getDepartmentsLookup()
      .pipe(takeUntilDestroyed())
      .subscribe((res) => this.departments.set(res.data));

    const id = this.employeeId();
    if (id !== null) {
      this.loading.set(true);
      this.employeeService
        .getById(id)
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(),
        )
        .subscribe({
          next: (res) => {
            const emp = res.data;
            this.form.patchValue({
              firstName: emp.firstName,
              lastName: emp.lastName,
              email: emp.email,
              phone: emp.phone,
              jobTitle: emp.jobTitle,
              departmentId: emp.departmentId,
              status: emp.status,
              salary: emp.salary,
              hireDate: emp.hireDate?.slice(0, 10),
            });
          },
          error: () => this.router.navigateByUrl("/employees"),
        });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();

    const payload = { ...raw, departmentId: raw.departmentId as number };
    const id = this.employeeId();

    const request$ =
      id !== null
        ? this.employeeService.update(id, payload)
        : this.employeeService.create(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.toast.success(
          id !== null ? "Employee updated." : "Employee created.",
        );
        this.router.navigateByUrl("/employees");
      },
    });
  }
}
