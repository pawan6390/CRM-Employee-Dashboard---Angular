import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ApiResponse } from "../../core/models/api-response.model";
import {
  ActivityItem,
  ChartPoint,
  DashboardStats,
} from "../../core/models/dashboard.model";
import { Employee, EmployeeStatus } from "../../core/models/employee.model";
import { User } from "../../core/models/user.model";

@Injectable({ providedIn: "root" })
export class DashboardService {
  getStats(): Observable<ApiResponse<DashboardStats>> {
    return of({
      success: true,
      message: "Dashboard stats loaded",
      data: {
        totalEmployees: 128,
        totalUsers: 24,
        totalDepartments: 6,
        activeEmployees: 112,
        employeesOnLeave: 8,
        newHiresThisMonth: 14,
      },
    });
  }

  getEmployeesByDepartmentChart(): Observable<ApiResponse<ChartPoint[]>> {
    return of({
      success: true,
      message: "Department chart loaded",
      data: [
        { label: "Engineering", value: 42 },
        { label: "Sales", value: 28 },
        { label: "HR", value: 18 },
        { label: "Support", value: 22 },
      ],
    });
  }

  getHiresByMonthChart(): Observable<ApiResponse<ChartPoint[]>> {
    return of({
      success: true,
      message: "Hires chart loaded",
      data: [
        { label: "Jan", value: 8 },
        { label: "Feb", value: 11 },
        { label: "Mar", value: 10 },
        { label: "Apr", value: 14 },
        { label: "May", value: 13 },
      ],
    });
  }

  getLatestUsers(limit = 5): Observable<ApiResponse<User[]>> {
    return of({
      success: true,
      message: "Latest users loaded",
      data: Array.from({ length: Math.min(limit, 3) }, (_, index) => ({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@demo.com`,
        role: index === 0 ? "ADMIN" : "EMPLOYEE",
        isActive: true,
        createdAt: new Date().toISOString(),
      })) as User[],
    });
  }

  getLatestEmployees(limit = 5): Observable<ApiResponse<Employee[]>> {
    return of({
      success: true,
      message: "Latest employees loaded",
      data: Array.from({ length: Math.min(limit, 4) }, (_, index) => ({
        id: index + 1,
        firstName: `Employee${index + 1}`,
        lastName: "Demo",
        email: `employee${index + 1}@demo.com`,
        phone: "+1234567890",
        jobTitle: "Team Member",
        departmentId: index + 1,
        status: EmployeeStatus.Active,
        salary: 70000 + index * 5000,
        hireDate: "2024-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) as Employee[],
    });
  }

  getLatestActivity(limit = 8): Observable<ApiResponse<ActivityItem[]>> {
    return of({
      success: true,
      message: "Recent activity loaded",
      data: Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
        id: index + 1,
        actorName: `User ${index + 1}`,
        action: "updated profile",
        targetType: "EMPLOYEE" as const,
        targetName: `Employee ${index + 1}`,
        timestamp: new Date().toISOString(),
      })),
    });
  }
}
