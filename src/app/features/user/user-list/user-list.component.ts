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
import { UserService } from "../user.service";
import { User } from "../../../core/models/user.model";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "../../../../environments/environment";
import { PagedResponse } from "../../../core/models/api-response.model";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PaginationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: "./user-list.component.html",
  styleUrl: "./user-list.component.scss",
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly page = signal(1);
  readonly pageSize = environment.defaultPageSize;
  readonly searchTerm = signal("");
  readonly deleteTarget = signal<User | null>(null);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((search) => {
          this.loading.set(true);
          this.page.set(1);
          return this.userService
            .list({ page: 1, pageSize: this.pageSize, search })
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => this.applyResult(res));

    this.fetchPage();
  }

  private applyResult(res: PagedResponse<User> | null): void {
    this.loading.set(false);
    if (!res) return;
    this.users.set(res.data);
    this.totalPages.set(res.meta.totalPages);
    this.totalItems.set(res.meta.totalItems);
  }

  fetchPage(): void {
    this.loading.set(true);
    this.userService
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

  confirmDelete(user: User): void {
    this.deleteTarget.set(user);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  performDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.userService.delete(target.id).subscribe({
      next: () => {
        this.toast.success(`${target.name} was deleted.`);
        this.deleteTarget.set(null);
        this.fetchPage();
      },
      error: () => this.deleteTarget.set(null),
    });
  }
}
