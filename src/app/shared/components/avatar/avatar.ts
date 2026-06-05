import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html'
})
export class AvatarComponent {
  src = input<string | null>(null);
  name = input<string>('');
  size = input<'sm' | 'md' | 'lg'>('md');

  initials = computed(() => {
    const n = this.name() || '';
    const parts = n.split(' ').filter(x => x);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  });

  get sizeClasses(): string {
    switch (this.size()) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-14 h-14 text-lg';
      default: return 'w-10 h-10 text-sm';
    }
  }
}
