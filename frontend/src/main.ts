import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authReducer } from './app/shared/store/auth/auth.reducer';
import { AuthEffects } from './app/shared/store/auth/auth.effects';
import { booksReducer } from './app/shared/store/books/books.reducer';
import { BooksEffects } from './app/shared/store/books/books.effects';
import { uiReducer } from './app/shared/store/ui/ui.reducer';
import { UiEffects } from './app/shared/store/ui/ui.effects';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(
      BrowserAnimationsModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      }),
    ),
    provideStore({ auth: authReducer, books: booksReducer, ui: uiReducer }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
    provideEffects([AuthEffects, BooksEffects, UiEffects]),
  ],
});
