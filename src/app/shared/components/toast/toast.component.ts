import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <div *ngFor="let toast of toastService.toasts()" 
           class="min-w-[250px] px-4 py-3 rounded shadow-lg text-white flex justify-between items-center animate-fade-in-up"
           [ngClass]="{
             'bg-green-600': toast.type === 'success',
             'bg-red-600': toast.type === 'error',
             'bg-blue-600': toast.type === 'info'
           }">
        <span>{{ toast.message }}</span>
        <button (click)="toastService.remove(toast.id)" class="ml-4 text-white hover:text-gray-200">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
