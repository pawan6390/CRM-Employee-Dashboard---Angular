export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PageQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
