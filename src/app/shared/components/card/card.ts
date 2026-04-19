import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html'
})
export class CardComponent {
  variant = input<'elevated' | 'filled' | 'outlined'>('elevated');
  hoverable = input<boolean>(false);
  clickable = input<boolean>(false);

  cardClick = output<void>();

  get cardClasses(): string {
    const classes = [`card-${this.variant()}`];
    
    // Add interaction classes 
    if (this.hoverable() || this.clickable()) {
      classes.push('transition-all', 'duration-normal', 'hover:shadow-lg', 'hover:-translate-y-0.5');
    }
    
    if (this.clickable()) {
      classes.push('cursor-pointer');
    }
    
    // Base styles setup in styles.css requires fallback explicit padding if not set
    classes.push('p-6');

    return classes.join(' ');
  }

  onClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }
}
