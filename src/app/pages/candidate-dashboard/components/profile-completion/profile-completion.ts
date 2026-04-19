import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-completion.html'
})
export class ProfileCompletionComponent {
  @Input() completionPercentage = 0;
}
