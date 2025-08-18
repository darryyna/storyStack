import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { AuthState } from '../../store/registration.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
}
