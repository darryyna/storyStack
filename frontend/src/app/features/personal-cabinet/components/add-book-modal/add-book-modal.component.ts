import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BooksService } from '../../../../core/services/books.service';
import { GoogleBook } from '../../../../core/models/book.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { selectBooksAdding } from '../../../../shared/store/books/books.selectors';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.scss']
})
export class AddBookModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AddBookModalComponent>);
  private readonly booksService = inject(BooksService);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });

  // state
  protected readonly filteredBooks =
    toSignal(
      this.searchControl.valueChanges.pipe(
        tap(() => this.selectedBook.set(null)),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchBooks(query))
      ),
      { initialValue: [] }
    );
  protected readonly selectedBook = signal<GoogleBook | null>(null);
  protected readonly isLoading = toSignal( this.store.select(selectBooksAdding),
    { initialValue: false });

  constructor() {
      this.actions$.pipe(
        ofType(BooksActions.addBookSuccess),
        takeUntilDestroyed()
      ).subscribe(() => {
        this.dialogRef.close(true);
      });
  }

    private searchBooks(query: string) {
      if (query.length <= 2) {
        return of([]);
      }
      return this.booksService.search(query).pipe(
        catchError(() => of([]))
      );

    }

    protected displayFn(book: GoogleBook | null): string {
      return book?.volumeInfo?.title ?? '';
    }

    protected onBookSelected(
      event: MatAutocompleteSelectedEvent
    ): void {
      const book = event.option.value as GoogleBook;
      this.selectedBook.set(book);
    }

    protected onCancel(): void {
      this.dialogRef.close();
    }

    protected onAddBook(): void {
      const book = this.selectedBook();
      if (!book) {
        return;
      }
      this.store.dispatch(BooksActions.addBook({ book }));
    }
}
