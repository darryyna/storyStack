import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BooksService } from '../../../../core/services/books.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { ManualBookModalData, SearchBook } from '../../../../core/models/book.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manual-book-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './manual-book-modal.component.html',
  styleUrls: ['./manual-book-modal.component.scss']
})
export class ManualBookModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ManualBookModalComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly booksService = inject(BooksService);
  private readonly store = inject(Store);
  private readonly data = inject<ManualBookModalData>(MAT_DIALOG_DATA);
  private readonly actions$ = inject(Actions);

  protected readonly isCustom = signal(this.data?.isCustom ?? false);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly isSaving = signal(false);

  protected readonly bookForm = this.fb.group({
    title: ['', [Validators.required]],
    authors: ['', [Validators.required]],
    description: [''],
    pageCount: [null as number | null]
  });

  constructor() {
    if (this.data?.book) {
      this.bookForm.patchValue({
        title: this.data.book.title,
        authors: this.data.book.authors?.join(', ') || '',
        description: this.data.book.description || '',
        pageCount: this.data.book.pageCount || null
      });
      if (this.data.book.thumbnail) {
        this.imagePreview.set(this.data.book.thumbnail);
      }
    }

    if (!this.data?.isCustom) {
      this.bookForm.disable();
    }
    this.actions$.pipe(
      ofType(BooksActions.addBookSuccess),
      takeUntilDestroyed()
    ).subscribe(() => this.dialogRef.close(true));
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected onRemoveImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onConfirmExternal(): void {
    if (!this.data?.book) return;
    this.store.dispatch(BooksActions.addBook({ book: this.data.book }));
  }

  protected onSubmit(): void {
    if (this.bookForm.invalid || this.isSaving() || !this.isCustom()) return;

    this.isSaving.set(true);
    const formValue = this.bookForm.getRawValue();
    const authorsArray = formValue.authors
      ? formValue.authors.split(',').map(a => a.trim())
      : [];

    const bookData: Partial<SearchBook> = {
      title: formValue.title!,
      authors: authorsArray,
      description: formValue.description || '',
      thumbnail: this.imagePreview() || undefined,
      pageCount: formValue.pageCount || undefined
    };

    if (this.data?.book?.id) {
      bookData.id = this.data.book.id;
    }

    const file = this.selectedFile();

    const saveExternal$ = file
      ? this.booksService.uploadCover(file).pipe(
        catchError(() => of({ url: bookData.thumbnail })),
        switchMap(res => {
          const updatedData = { ...bookData, thumbnail: (res as { url: string | undefined }).url };
          return bookData.id
            ? this.booksService.addExternalBook(updatedData as SearchBook)
            : this.booksService.addManualBook(updatedData);
        })
      )
      : bookData.id
        ? this.booksService.addExternalBook(bookData as SearchBook)
        : this.booksService.addManualBook(bookData);

    saveExternal$.pipe(
      switchMap(externalBook => this.booksService.addUserBook(externalBook.id)),
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: (userBook) => {
        this.store.dispatch(BooksActions.addBookSuccess({ book: userBook }));
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.store.dispatch(BooksActions.addBookFailure({ error: err.message || 'Failed to add book' }));
      }
    });
  }
}
