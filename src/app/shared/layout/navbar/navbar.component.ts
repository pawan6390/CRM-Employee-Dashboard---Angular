import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ClickOutsideDirective } from "../../directives/click-outside.directive";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  @Output() toggleSidebar = new EventEmitter<void>();

  readonly currentUser = this.authService.currentUser;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
