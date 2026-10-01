import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from "rxjs";
import { PaginationComponent } from "../../../shared/components/pagination/pagination.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { EmployeeService } from "../employee.service";
import {
  Employee,
  EmployeeFilterPayload,
  EmployeeStatus,
} from "../../../core/models/employee.model";
import { PagedResponse } from "../../../core/models/api-response.model";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-employee-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PaginationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: "./employee-list.component.html",
  styleUrl: "./employee-list.component.scss",
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly toast = inject(ToastService);

  readonly EmployeeStatus = EmployeeStatus;

  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  readonly searchTerm = signal("");
  readonly statusFilter = signal<EmployeeStatus | null>(null);
  readonly departmentFilter = signal<number | null>(null);
  readonly page = signal(1);
  readonly pageSize = environment.defaultPageSize;
  readonly sortBy = signal("firstName");
  readonly sortDir = signal<"asc" | "desc">("asc");

  readonly departments = signal<{ id: number; name: string }[]>([]);

  readonly deleteTarget = signal<Employee | null>(null);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.loadDepartments();

    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loading.set(true);
          this.page.set(1);
          return this.employeeService.list(this.buildFilter(term)).pipe(
            catchError(() => {
              this.toast.error("Could not load employees.");
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.applyResult(res));

    this.fetchPage();
  }

  private buildFilter(search: string): EmployeeFilterPayload {
    return {
      search,
      departmentId: this.departmentFilter(),
      status: this.statusFilter(),
      page: this.page(),
      pageSize: this.pageSize,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    };
  }

  private applyResult(res: PagedResponse<Employee> | null): void {
    this.loading.set(false);
    if (!res) return;
    this.employees.set(res.data);
    this.totalPages.set(res.meta.totalPages);
    this.totalItems.set(res.meta.totalItems);
  }

  fetchPage(): void {
    this.loading.set(true);
    this.employeeService
      .list(this.buildFilter(this.searchTerm()))
      .pipe(
        catchError(() => {
          this.toast.error("Could not load employees.");
          return of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.applyResult(res));
  }

  private loadDepartments(): void {
    this.employeeService
      .getDepartmentsLookup()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => this.departments.set(res.data),
        error: () => this.toast.error("Could not load department list."),
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  onFilterChange(): void {
    this.page.set(1);
    this.fetchPage();
  }

  onSort(column: string): void {
    if (this.sortBy() === column) {
      this.sortDir.set(this.sortDir() === "asc" ? "desc" : "asc");
    } else {
      this.sortBy.set(column);
      this.sortDir.set("asc");
    }
    this.fetchPage();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.fetchPage();
  }

  confirmDelete(emp: Employee): void {
    this.deleteTarget.set(emp);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  performDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.employeeService.delete(target.id).subscribe({
      next: () => {
        this.toast.success(
          `${target.firstName} ${target.lastName} was deleted.`,
        );
        this.deleteTarget.set(null);
        this.fetchPage();
      },
      error: () => this.deleteTarget.set(null),
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
