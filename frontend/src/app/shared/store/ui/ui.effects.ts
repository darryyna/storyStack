import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { delay, map } from 'rxjs/operators';
import * as UiActions from './ui.actions';

@Injectable()
export class UiEffects {
    private readonly actions$ = inject(Actions);

    hideToastAfterDelay$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UiActions.showToast),
            delay(3000), // Change to 3000ms as requested
            map(() => UiActions.hideToast())
        )
    );
}
