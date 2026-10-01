import { PaginationMeta } from "./pagination.model";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
