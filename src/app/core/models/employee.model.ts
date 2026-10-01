export enum EmployeeStatus {
  Active = "ACTIVE",
  OnLeave = "ON_LEAVE",
  Terminated = "TERMINATED",
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  departmentId: number;
  departmentName?: string;
  status: EmployeeStatus;
  salary: number;
  hireDate: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  departmentId: number;
  status: EmployeeStatus;
  salary: number;
  hireDate: string;
}

export type UpdateEmployeePayload = CreateEmployeePayload;

export type PatchEmployeePayload = Partial<CreateEmployeePayload>;

export interface EmployeeFilterPayload {
  search?: string;
  departmentId?: number | null;
  status?: EmployeeStatus | null;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
