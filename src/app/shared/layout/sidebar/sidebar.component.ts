import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { RouterLinkActive, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { UserRole } from "../../../core/models/user.model";

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  collapsed = input(false);

  private readonly allNavItems: NavItem[] = [
    { label: "Dashboard", icon: "bi-speedometer2", route: "/dashboard" },
    { label: "Employees", icon: "bi-people", route: "/employees" },
    {
      label: "Users",
      icon: "bi-person-badge",
      route: "/users",
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      label: "Departments",
      icon: "bi-diagram-3",
      route: "/departments",
      roles: [UserRole.Admin, UserRole.Manager],
    },
    { label: "Profile", icon: "bi-person-circle", route: "/profile" },
    { label: "Settings", icon: "bi-gear", route: "/settings" },
  ];

  readonly navItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    return this.allNavItems.filter(
      (item) => !item.roles || (role && item.roles.includes(role)),
    );
  });
}
