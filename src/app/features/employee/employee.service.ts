import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import {
  ApiResponse,
  PagedResponse,
} from "../../core/models/api-response.model";
import {
  CreateEmployeePayload,
  Employee,
  EmployeeFilterPayload,
  EmployeeStatus,
  PatchEmployeePayload,
  UpdateEmployeePayload,
} from "../../core/models/employee.model";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private departmentsCache$?: Observable<
    ApiResponse<{ id: number; name: string }[]>
  >;

  list(filter: EmployeeFilterPayload): Observable<PagedResponse<Employee>> {
    const data: Employee[] = Array.from(
      { length: Math.min(filter.pageSize, 5) },
      (_, index) => ({
        id: index + 1 + (filter.page - 1) * filter.pageSize,
        firstName: `Employee${index + 1}`,
        lastName: "Demo",
        email: `employee${index + 1}@demo.com`,
        phone: "+1234567890",
        jobTitle: "Team Member",
        departmentId: (index % 4) + 1,
        status:
          index % 2 === 0 ? EmployeeStatus.Active : EmployeeStatus.OnLeave,
        salary: 70000 + index * 5000,
        hireDate: "2024-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );

    return of({
      success: true,
      message: "Employees loaded",
      data,
      meta: {
        page: filter.page,
        pageSize: filter.pageSize,
        totalItems: 12,
        totalPages: 3,
      },
    });
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    const employee: Employee = {
      id,
      firstName: "Demo",
      lastName: "Employee",
      email: `employee${id}@demo.com`,
      phone: "+1234567890",
      jobTitle: "Team Member",
      departmentId: 1,
      status: EmployeeStatus.Active,
      salary: 70000,
      hireDate: "2024-01-01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return of({ success: true, message: "Employee loaded", data: employee });
  }

  create(payload: CreateEmployeePayload): Observable<ApiResponse<Employee>> {
    return of({
      success: true,
      message: "Employee created",
      data: {
        ...payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: payload.status,
      } as Employee,
    });
  }

  update(
    id: number,
    payload: UpdateEmployeePayload,
  ): Observable<ApiResponse<Employee>> {
    return of({
      success: true,
      message: "Employee updated",
      data: {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Employee,
    });
  }

  patch(
    id: number,
    payload: PatchEmployeePayload,
  ): Observable<ApiResponse<Employee>> {
    return of({
      success: true,
      message: "Employee updated",
      data: {
        id,
        firstName: "Demo",
        lastName: "Employee",
        email: "demo@demo.com",
        phone: "+1234567890",
        jobTitle: "Team Member",
        departmentId: 1,
        status: EmployeeStatus.Active,
        salary: 70000,
        hireDate: "2024-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      } as Employee,
    });
  }

  delete(id: number): Observable<ApiResponse<{ id: number }>> {
    return of({ success: true, message: "Employee deleted", data: { id } });
  }

  getDepartmentsLookup(): Observable<
    ApiResponse<{ id: number; name: string }[]>
  > {
    if (!this.departmentsCache$) {
      this.departmentsCache$ = of({
        success: true,
        message: "Departments loaded",
        data: [
          { id: 1, name: "Engineering" },
          { id: 2, name: "Sales" },
          { id: 3, name: "HR" },
          { id: 4, name: "Support" },
        ],
      });
    }
    return this.departmentsCache$;
  }
}
