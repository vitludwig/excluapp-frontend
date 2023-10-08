import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'home',
		loadComponent: () => import('./modules/home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: 'party',
		loadComponent: () => import('./modules/sale/sale.component').then((m) => m.SaleComponent),
	},
	{
		path: 'registration',
		data: {
			title: 'Registration',
		},
		children: [
			{
				path: '',
				loadComponent: () => import('./modules/registration/components/registration-list/registration-list.component').then((m) => m.RegistrationListComponent),
			},
			{
				path: ':eventId',
				loadComponent: () => import('./modules/registration/components/registration-detail/registration-detail.component').then((m) => m.RegistrationDetailComponent),
			},
		],
	},
	{
		path: 'admin',
		children: [
			{
				path: 'events',
				data: {
					title: 'Events',
				},
				children: [
					{
						path: '',
						loadComponent: () => import('./modules/admin/components/events/event-list/event-list.component').then((m) => m.EventListComponent),
					},
					{
						path: 'new',
						loadComponent: () => import('./modules/admin/components/events/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('./modules/admin/components/events/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
					},
				],
			},
			{
				path: 'users',
				data: {
					title: 'Users',
				},
				children: [
					{
						path: '',
						loadComponent: () => import('./modules/admin/components/users/user-list/user-list.component').then((m) => m.UserListComponent),
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('./modules/admin/components/users/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
					},
					{
						path: 'new',
						loadComponent: () => import('./modules/admin/components/users/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
					},
				],
			},
			{
				path: 'sortiment',
				data: {
					title: 'Sortiment',
				},
				children: [
					{
						path: '',
						loadComponent: () => import('./modules/admin/components/sortiment/sortiment-list/sortiment-list.component').then((m) => m.SortimentListComponent),
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('./modules/admin/components/sortiment/sortiment-detail/sortiment-detail.component').then((m) => m.SortimentDetailComponent),
					},
					{
						path: 'new',
						loadComponent: () => import('./modules/admin/components/sortiment/sortiment-detail/sortiment-detail.component').then((m) => m.SortimentDetailComponent),
					},
				],
			},
			{
				path: 'statistics',
				data: {
					title: 'Infoporno',
				},
				loadComponent: () => import('./modules/admin/components/statistics/statistics.component').then((m) => m.StatisticsComponent),
			},
		],
	},
	{
		path: '**',
		redirectTo: 'home',
	},
];
