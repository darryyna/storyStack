import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MainComponent } from './shared/components/main/main.component';
import { AppRoutingModule } from './app.routes';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoginFormComponent } from './shared/components/login-form/login-form.component';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthState } from './shared/store/registration.state';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    FooterComponent,
    LoginFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    AppRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    RouterOutlet,
    MatCheckbox,
    NgxsModule.forRoot([AuthState], { developmentMode: /** !environment.production */ true }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      keys: '*',
    }),
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
