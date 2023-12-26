import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [],
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebtsComponent {

}
