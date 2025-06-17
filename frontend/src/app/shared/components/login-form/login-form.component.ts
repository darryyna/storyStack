import { Component } from '@angular/core';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {

  public activeTab: 'login' | 'signup' = 'login';

  setActiveTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }
}
