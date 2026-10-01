import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class LoadingService {
  private readonly requestCount = signal(0);

  readonly isLoading = signal(false);

  show(): void {
    this.requestCount.update((count) => count + 1);
    this.isLoading.set(true);
  }

  hide(): void {
    this.requestCount.update((count) => Math.max(0, count - 1));
    if (this.requestCount() === 0) {
      this.isLoading.set(false);
    }
  }
}
