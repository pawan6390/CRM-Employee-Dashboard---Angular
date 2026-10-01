import { Injectable, inject } from "@angular/core";
import { Observable, retry, shareReplay } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import {
  ApiResponse,
  PagedResponse,
} from "../../core/models/api-response.model";
import {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "../../core/models/department.model";
import { PageQuery } from "../../core/models/pagination.model";
import { User } from "../../core/models/user.model";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private readonly api = inject(ApiService);

  private managersCache$?: Observable<ApiResponse<User[]>>;

  list(query: PageQuery): Observable<PagedResponse<Department>> {
    return this.api
      .get<PagedResponse<Department>>("/departments", { ...query })
      .pipe(retry(1));
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.api.get<ApiResponse<Department>>(`/departments/${id}`);
  }

  create(
    payload: CreateDepartmentPayload,
  ): Observable<ApiResponse<Department>> {
    return this.api.post<ApiResponse<Department>>("/departments", payload);
  }

  update(
    id: number,
    payload: UpdateDepartmentPayload,
  ): Observable<ApiResponse<Department>> {
    return this.api.put<ApiResponse<Department>>(`/departments/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<{ id: number }>> {
    return this.api.delete<ApiResponse<{ id: number }>>(`/departments/${id}`);
  }

  getManagersLookup(): Observable<ApiResponse<User[]>> {
    if (!this.managersCache$) {
      this.managersCache$ = this.api
        .get<ApiResponse<User[]>>("/users/managers-lookup")
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.managersCache$;
  }
}
