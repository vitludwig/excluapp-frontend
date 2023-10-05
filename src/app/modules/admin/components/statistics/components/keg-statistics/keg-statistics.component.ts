import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keg-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keg-statistics.component.html',
  styleUrls: ['./keg-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KegStatisticsComponent {

}
