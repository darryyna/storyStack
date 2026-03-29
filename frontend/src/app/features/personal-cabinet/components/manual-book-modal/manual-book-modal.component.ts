import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BooksService } from '../../../../core/services/books.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { SearchBook } from '../../../../core/models/book.model';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-manual-book-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './manual-book-modal.component.html',
  styleUrls: ['./manual-book-modal.component.scss']
})
export class ManualBookModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ManualBookModalComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly booksService = inject(BooksService);
  private readonly store = inject(Store);

  protected readonly bookForm = this.fb.group({
    title: ['', [Validators.required]],
    authors: ['', [Validators.required]],
    description: ['']
  });

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly isSaving = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: SearchBook) {
    if (data) {
      this.bookForm.patchValue({
        title: data.title,
        authors: data.authors?.join(', ') || '',
        description: data.description || ''
      });
      if (data.thumbnail) {
        this.imagePreview.set(data.thumbnail);
      }
    }
  }
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  protected onRemoveImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.bookForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    const formValue = this.bookForm.value;
    const authorsArray = formValue.authors ? formValue.authors.split(',').map(a => a.trim()) : [];

    const bookData: Partial<SearchBook> = {
      title: formValue.title!,
      authors: authorsArray,
      description: formValue.description || '',
      thumbnail: this.imagePreview() || undefined
    };

    if (this.data?.id) {
      bookData.id = this.data.id;
    }

    const file = this.selectedFile();

    const saveExternal$ = file
      ? this.booksService.uploadCover(file).pipe(
        catchError(() => of({ url: bookData.thumbnail })), // Fallback to current thumbnail if upload fails
        switchMap(res => {
          const updatedData = { ...bookData, thumbnail: (res as { url: string | undefined }).url };
          return bookData.id
            ? this.booksService.addExternalBook(updatedData as SearchBook)
            : this.booksService.addManualBook(updatedData);
        })
      )
      : (bookData.id
        ? this.booksService.addExternalBook(bookData as SearchBook)
        : this.booksService.addManualBook(bookData));

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
