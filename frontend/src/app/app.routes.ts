import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainComponent } from './shared/components/main/main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'StoryStack'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
