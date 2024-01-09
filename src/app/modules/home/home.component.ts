import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [ButtonModule, RouterLink],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
