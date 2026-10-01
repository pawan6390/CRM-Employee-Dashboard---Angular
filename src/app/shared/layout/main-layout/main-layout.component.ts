import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: "./main-layout.component.html",
  styleUrl: "./main-layout.component.scss",
})
export class MainLayoutComponent {
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
