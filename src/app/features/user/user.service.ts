import { Injectable, inject } from "@angular/core";
import { Observable, retry } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import {
  ApiResponse,
  PagedResponse,
} from "../../core/models/api-response.model";
import {
  CreateUserPayload,
  PatchUserPayload,
  UpdateUserPayload,
  User,
} from "../../core/models/user.model";
import { PageQuery } from "../../core/models/pagination.model";

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly api = inject(ApiService);

  list(query: PageQuery): Observable<PagedResponse<User>> {
    return this.api
      .get<PagedResponse<User>>("/users", { ...query })
      .pipe(retry(1));
  }

  getById(id: number): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/users/${id}`);
  }

  create(payload: CreateUserPayload): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>("/users", payload);
  }

  update(
    id: number,
    payload: UpdateUserPayload,
  ): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(`/users/${id}`, payload);
  }

  patch(id: number, payload: PatchUserPayload): Observable<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>(`/users/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<{ id: number }>> {
    return this.api.delete<ApiResponse<{ id: number }>>(`/users/${id}`);
  }
}
