import { CommonModule } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./pagination.component.html",
  styleUrl: "./pagination.component.scss",
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  });

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage())
      return;
    this.pageChange.emit(page);
  }
}
