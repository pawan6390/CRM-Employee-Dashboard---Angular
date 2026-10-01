import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from "@angular/core";

@Directive({ selector: "[appClickOutside]", standalone: true })
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Output() appClickOutside = new EventEmitter<MouseEvent>();

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(
      event.target as Node,
    );
    if (!clickedInside) {
      this.appClickOutside.emit(event);
    }
  }
}
