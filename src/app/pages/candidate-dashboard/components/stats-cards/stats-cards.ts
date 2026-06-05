import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  templateUrl: './stats-cards.html'
})
export class StatsCardsComponent {
  @Input() applicationsCount = 0;
  @Input() viewsCount = 0;
  @Input() savedCount = 0;
}
