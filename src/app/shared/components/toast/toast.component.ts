import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  iconFor(type: string): string {
    switch (type) {
      case "success":
        return "bi-check-circle-fill";
      case "error":
        return "bi-x-circle-fill";
      case "warning":
        return "bi-exclamation-triangle-fill";
      default:
        return "bi-info-circle-fill";
    }
  }
}
