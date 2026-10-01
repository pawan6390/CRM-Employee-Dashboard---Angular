import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
})
export class ConfirmDialogComponent {
  visible = input(false);
  title = input("Confirm action");
  message = input("Are you sure you want to proceed? This cannot be undone.");
  confirmLabel = input("Delete");

  confirmed = output<void>();
  cancelled = output<void>();
}
