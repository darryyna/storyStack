import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BooksService } from '../../../../core/services/books.service';
import { SearchBook } from '../../../../core/models/book.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { selectBooksAdding } from '../../../../shared/store/books/books.selectors';
import { ManualBookModalComponent } from '../manual-book-modal/manual-book-modal.component';
import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ResolveUrlPipe
  ],
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.scss']
})
export class AddBookModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AddBookModalComponent>);
  private readonly dialog = inject(MatDialog);
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
  protected readonly selectedBook = signal<SearchBook | null>(null);
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

    protected displayFn(book: SearchBook | null): string {
      return book?.title ?? '';
    }

    protected onBookClick(book: SearchBook): void {
      this.dialogRef.close(book);
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

    protected onAddManually(): void {
      this.dialog.open(ManualBookModalComponent, {
        width: '600px',
        autoFocus: false
      }).afterClosed().subscribe((result: boolean | undefined) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
    }
}
