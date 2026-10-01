export interface Department {
  id: number;
  name: string;
  code: string;
  managerId?: number | null;
  managerName?: string | null;
  employeeCount?: number;
  createdAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  managerId?: number | null;
}

export interface UpdateDepartmentPayload {
  name: string;
  code: string;
  managerId?: number | null;
}
