import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { ApiResponse } from "../../core/models/api-response.model";
import { User } from "../../core/models/user.model";

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

@Injectable({ providedIn: "root" })
export class ProfileService {
  private readonly api = inject(ApiService);

  getMyProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>("/profile");
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>("/profile", payload);
  }

  uploadAvatar(file: File): Observable<ApiResponse<AvatarUploadResponse>> {
    const formData = new FormData();
    formData.append("avatar", file);
    return this.api.post<ApiResponse<AvatarUploadResponse>>(
      "/profile/avatar",
      formData,
    );
  }
}
