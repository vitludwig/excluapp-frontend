import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-face-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-face-recognition.component.html',
  styleUrls: ['./user-face-recognition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFaceRecognitionComponent {

}
