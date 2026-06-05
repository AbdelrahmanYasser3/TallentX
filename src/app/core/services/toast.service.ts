import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'ai-insight';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastCounter = 0;
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'ai-insight' = 'info') {
    const id = ++this.toastCounter;
    this.toasts.update(t => [...t, { id, message, type }]);
    
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  aiInsight(message: string) {
    this.show(message, 'ai-insight');
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
