import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { catchError, finalize, of } from "rxjs";
import { DashboardService } from "./dashboard.service";
import {
  ActivityItem,
  ChartPoint,
  DashboardStats,
} from "../../core/models/dashboard.model";
import { Employee } from "../../core/models/employee.model";
import { User } from "../../core/models/user.model";

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly departmentChart = signal<ChartPoint[]>([]);
  readonly hiresChart = signal<ChartPoint[]>([]);
  readonly latestUsers = signal<User[]>([]);
  readonly latestEmployees = signal<Employee[]>([]);
  readonly latestActivity = signal<ActivityItem[]>([]);

  readonly statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        label: "Total Employees",
        value: s.totalEmployees,
        icon: "bi-people-fill",
        color: "#4f46e5",
      },
      {
        label: "Total Users",
        value: s.totalUsers,
        icon: "bi-person-badge-fill",
        color: "#0891b2",
      },
      {
        label: "Departments",
        value: s.totalDepartments,
        icon: "bi-diagram-3-fill",
        color: "#16a34a",
      },
      {
        label: "On Leave",
        value: s.employeesOnLeave,
        icon: "bi-airplane-fill",
        color: "#f59e0b",
      },
    ];
  });

  readonly maxDepartmentValue = computed(() =>
    Math.max(1, ...this.departmentChart().map((p) => p.value)),
  );
  readonly maxHiresValue = computed(() =>
    Math.max(1, ...this.hiresChart().map((p) => p.value)),
  );

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);

    forkJoin({
      stats: this.dashboardService.getStats(),
      departmentChart: this.dashboardService.getEmployeesByDepartmentChart(),
      hiresChart: this.dashboardService.getHiresByMonthChart(),
      users: this.dashboardService.getLatestUsers(5),
      employees: this.dashboardService.getLatestEmployees(5),
      activity: this.dashboardService.getLatestActivity(8),
    })
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (!result) return;
        this.stats.set(result.stats.data);
        this.departmentChart.set(result.departmentChart.data);
        this.hiresChart.set(result.hiresChart.data);
        this.latestUsers.set(result.users.data);
        this.latestEmployees.set(result.employees.data);
        this.latestActivity.set(result.activity.data);
      });
  }
}
