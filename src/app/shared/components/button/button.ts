import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html'
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'ai'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit'>('button');

  clicked = output<MouseEvent>();

  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant()}`];

    if (this.size() === 'sm') {
      classes.push('btn-sm');
    } else if (this.size() === 'lg') {
      classes.push('btn-lg');
    }

    if (this.fullWidth()) {
      classes.push('w-full');
    }

    if (this.disabled() || this.loading()) {
      classes.push('opacity-50', 'cursor-not-allowed');
    }

    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    } else {
      // Prevent default action if button is disabled effectively
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
