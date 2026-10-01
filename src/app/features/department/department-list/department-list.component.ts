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
import { DepartmentService } from "../department.service";
import { Department } from "../../../core/models/department.model";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "../../../../environments/environment";
import { PagedResponse } from "../../../core/models/api-response.model";

@Component({
  selector: "app-department-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PaginationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: "./department-list.component.html",
  styleUrl: "./department-list.component.scss",
})
export class DepartmentListComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly toast = inject(ToastService);

  readonly departments = signal<Department[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly page = signal(1);
  readonly pageSize = environment.defaultPageSize;
  readonly searchTerm = signal("");
  readonly deleteTarget = signal<Department | null>(null);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((search) => {
          this.loading.set(true);
          this.page.set(1);
          return this.departmentService
            .list({ page: 1, pageSize: this.pageSize, search })
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.applyResult(res));

    this.fetchPage();
  }

  private applyResult(res: PagedResponse<Department> | null): void {
    this.loading.set(false);
    if (!res) return;
    this.departments.set(res.data);
    this.totalPages.set(res.meta.totalPages);
    this.totalItems.set(res.meta.totalItems);
  }

  fetchPage(): void {
    this.loading.set(true);
    this.departmentService
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.searchTerm(),
      })
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.applyResult(res));
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.fetchPage();
  }

  confirmDelete(dept: Department): void {
    this.deleteTarget.set(dept);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  performDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.departmentService.delete(target.id).subscribe({
      next: () => {
        this.toast.success(`${target.name} was deleted.`);
        this.deleteTarget.set(null);
        this.fetchPage();
      },
      error: () => {
        this.deleteTarget.set(null);
      },
    });
  }
}
