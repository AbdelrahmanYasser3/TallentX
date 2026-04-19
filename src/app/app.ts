import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./layout/navbar/navbar";
import { Footer } from "./layout/footer/footer";
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, ToastComponent],
  templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('Ai-Hiring-System');

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme is automatically loaded in ThemeService constructor
    // but we ensure it's applied when the app initializes
    this.themeService.loadTheme();
  }
}
