import { Routes } from '@angular/router';
import { MainComponent } from './shared/components/main/main.component';
import { LoginFormComponent } from './shared/components/login-form/login-form.component';
import { AboutPageComponent } from './features/about-page/about-page.component';
import { authGuard } from './core/guards/auth.guard';
import { PersonalCabinetComponent } from './features/personal-cabinet/personal-cabinet.component';
import { BooksListComponent } from './features/personal-cabinet/components/books-list/books-list.component';
import { BookDetailsComponent } from './features/personal-cabinet/components/book-details/book-details.component';
import { ResetPasswordComponent } from './shared/components/login-form/reset-password/reset-password.component';
import { StatisticsComponent } from './features/statistics/statistics.component';
import { GoalsComponent } from './features/goals/goals.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'StoryStack',
  },
  {
    path: 'login',
    component: LoginFormComponent,
  },
  { path: 'reset-password',
    component: ResetPasswordComponent },
  {
    path: 'about',
    component: AboutPageComponent
  },
  {
    path: 'personal-cabinet',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: PersonalCabinetComponent,
      },
      {
        path: 'books',
        component: BooksListComponent,
        title: 'StoryStack - My Books'
      },
      {
        path: 'books/:id',
        component: BookDetailsComponent,
        title: 'StoryStack - Book Details'
      },
      {
        path: 'statistics',
        component: StatisticsComponent,
        title: 'StoryStack - My Statistics'
      },
      {
        path: 'goals',
        component: GoalsComponent,
        title: 'StoryStack - My Goals'
      }
    ]
  }
];
