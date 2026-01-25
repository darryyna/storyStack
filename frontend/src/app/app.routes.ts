import { Routes } from '@angular/router';
import { MainComponent } from './shared/components/main/main.component';
import { LoginFormComponent } from './shared/components/login-form/login-form.component';

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
];
