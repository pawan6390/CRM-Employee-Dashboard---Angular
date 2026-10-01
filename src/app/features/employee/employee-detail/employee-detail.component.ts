import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { EmployeeService } from "../employee.service";
import { Employee, EmployeeStatus } from "../../../core/models/employee.model";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-employee-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./employee-detail.component.html",
  styleUrl: "./employee-detail.component.scss",
})
export class EmployeeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  private readonly toast = inject(ToastService);

  readonly employee = signal<Employee | null>(null);
  readonly loading = signal(true);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.employeeService
      .getById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (res) => this.employee.set(res.data),
        error: () => this.toast.error("Employee not found."),
      });
  }

  statusBadgeClass(status: EmployeeStatus): string {
    switch (status) {
      case EmployeeStatus.Active:
        return "status-badge status-badge--active";
      case EmployeeStatus.OnLeave:
        return "status-badge status-badge--on-leave";
      default:
        return "status-badge status-badge--terminated";
    }
  }
}
