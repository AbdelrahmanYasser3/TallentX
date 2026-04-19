import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  templateUrl: './skeleton.html'
})
export class SkeletonComponent {
  variant = input<'text' | 'circle' | 'card' | 'rect'>('text');
  width = input<string>('100%');
  height = input<string>('1rem');
  lines = input<number>(1);

  get linesArray(): number[] {
    return Array.from({ length: this.lines() }, (_, i) => i);
  }
}
