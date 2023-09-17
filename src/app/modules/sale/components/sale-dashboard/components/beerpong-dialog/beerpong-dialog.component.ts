import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-beerpong-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beerpong-dialog.component.html',
  styleUrls: ['./beerpong-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeerpongDialogComponent {

}
