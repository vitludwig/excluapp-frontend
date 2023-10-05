import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStatisticsComponent {

}
