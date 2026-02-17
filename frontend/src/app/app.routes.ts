import { Routes } from '@angular/router';
import { MainComponent } from './shared/components/main/main.component';
import { LoginFormComponent } from './shared/components/login-form/login-form.component';
import { AboutPageComponent } from './features/about-page/about-page.component';
import { authGuard } from './core/guards/auth.guard';
import { PersonalCabinetComponent } from './features/personal-cabinet/personal-cabinet.component';

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
  {
    path: 'about',
    component: AboutPageComponent
  },
  {
    path: 'personal-cabinet',
    component: PersonalCabinetComponent,
    canActivate: [authGuard]
  }
];
