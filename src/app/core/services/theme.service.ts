
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'hiring-system-theme';
  isDarkMode = signal(false);

  constructor() {
    this.loadTheme();
  }

  /**
   * Load theme from localStorage or system preference
   */
  loadTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    
    if (saved) {
      const isDark = saved === 'dark';
      this.isDarkMode.set(isDark);
      this.applyTheme(isDark);
    } else {
      // Check system preference; fallback is needed for test environments without matchMedia.
      const prefersDark =
        typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false;
      this.isDarkMode.set(prefersDark);
      this.applyTheme(prefersDark);
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    const newValue = !this.isDarkMode();
    this.setTheme(newValue);
  }

  /**
   * Set dark mode
   */
  setDarkMode(): void {
    this.setTheme(true);
  }

  /**
   * Set light mode
   */
  setLightMode(): void {
    this.setTheme(false);
  }

  /**
   * Private method to set theme and update localStorage
   */
  private setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  /**
   * Apply theme by adding/removing dark class from html element
   */
  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Get current dark mode state
   */
  getDarkMode(): boolean {
    return this.isDarkMode();
  }
}
