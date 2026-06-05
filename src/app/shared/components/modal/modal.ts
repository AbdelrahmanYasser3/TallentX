import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html'
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg'>('md');

  closed = output<void>();

  get modalSizeClasses(): string {
    switch (this.size()) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-4xl';
      default: return 'max-w-2xl'; // md
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
