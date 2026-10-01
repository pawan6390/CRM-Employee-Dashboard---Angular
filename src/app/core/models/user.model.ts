export enum UserRole {
  Admin = "ADMIN",
  Manager = "MANAGER",
  Employee = "EMPLOYEE",
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type PatchUserPayload = Partial<UpdateUserPayload>;
