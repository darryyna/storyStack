import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainComponent } from './shared/components/main/main.component';
import { LoginFormComponent } from './shared/components/login-form/login-form.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'StoryStack'
  },
  {
    path: 'login',
    component: LoginFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
