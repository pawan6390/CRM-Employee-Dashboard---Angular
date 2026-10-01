export interface DashboardStats {
  totalEmployees: number;
  totalUsers: number;
  totalDepartments: number;
  activeEmployees: number;
  employeesOnLeave: number;
  newHiresThisMonth: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: number;
  actorName: string;
  action: string;
  targetType: "EMPLOYEE" | "USER" | "DEPARTMENT";
  targetName: string;
  timestamp: string;
}
