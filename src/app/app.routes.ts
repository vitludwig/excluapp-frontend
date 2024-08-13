import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'home',
		loadComponent: () => import('@modules/home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: 'party',
		loadComponent: () => import('@modules/sale/sale.component').then((m) => m.SaleComponent),
		data: {
			title: 'Párty!',
		},
	},
	{
		path: 'registration',
		data: {
			title: 'Registrace',
		},
		children: [
			{
				path: '',
				loadComponent: () => import('@modules/registration/components/registration-list/registration-list.component').then((m) => m.RegistrationListComponent),
			},
			{
				path: ':eventId',
				loadComponent: () => import('@modules/registration/components/registration-detail/registration-detail.component').then((m) => m.RegistrationDetailComponent),
			},
		],
	},
	{
		path: 'admin',
		children: [
			{
				path: 'events',
				children: [
					{
						path: '',
						loadComponent: () => import('@modules/event/components/event-list/event-list.component').then((m) => m.EventListComponent),
						data: {
							title: 'Události',
						},
					},
					{
						path: 'new',
						loadComponent: () => import('@modules/event/components/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
						data: {
							title: 'Nová událost',
						},
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('@modules/event/components/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
					},
				],
			},
			{
				path: 'users',
				children: [
					{
						path: '',
						loadComponent: () => import('@modules/user/components/user-list/user-list.component').then((m) => m.UserListComponent),
						data: {
							title: 'Uživatelé',
						},
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('@modules/user/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
					},
					{
						path: 'new',
						loadComponent: () => import('@modules/user/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
						data: {
							title: 'Nový uživatel',
						},
					},
				],
			},
			{
				path: 'sortiment',
				data: {
					title: 'Sudy',
				},
				children: [
					{
						path: '',
						loadComponent: () => import('@modules/sortiment/components/sortiment-list/sortiment-list.component').then((m) => m.SortimentListComponent),
					},
					{
						path: 'detail/:id',
						loadComponent: () => import('@modules/sortiment/components/sortiment-detail/sortiment-detail.component').then((m) => m.SortimentDetailComponent),
					},
					{
						path: 'new',
						loadComponent: () => import('@modules/sortiment/components/sortiment-detail/sortiment-detail.component').then((m) => m.SortimentDetailComponent),
					},
				],
			},
			{
				path: 'statistics',
				data: {
					title: 'Infoporno',
				},
				loadComponent: () => import('@modules/statistics/statistics.component').then((m) => m.StatisticsComponent),
			},
			{
				path: 'payments',
				data: {
					title: 'Platby',
				},
				loadComponent: () => import('@modules/payment/payments.component').then((m) => m.PaymentsComponent),
			},
		],
	},
	{
		path: '**',
		redirectTo: 'home',
	},
];
