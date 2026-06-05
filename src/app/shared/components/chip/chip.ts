import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.html'
})
export class ChipComponent {
  label = input.required<string>();
  removable = input<boolean>(false);
  variant = input<'default' | 'ai'>('default');

  removed = output<void>();

  get chipClasses(): string {
    const base = 'chip';
    return this.variant() === 'ai' ? `${base} chip-ai shadow-sm` : base;
  }

  onRemove(): void {
    if (this.removable()) {
      this.removed.emit();
    }
  }
}
