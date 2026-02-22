import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { selectSelectedBook, selectBooksLoading } from '../../../../shared/store/books/books.selectors';
import { BookStatus } from '../../../../core/models/book.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, MatButtonModule, MatIconModule, MatDialogModule, LoaderComponent],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly book = toSignal(this.store.select(selectSelectedBook));
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });

  protected readonly statuses = Object.values(BookStatus);
  protected readonly ratings = [1, 2, 3, 4, 5];

  protected newTag = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(BooksActions.loadBook({ id }));
    }
  }

  protected updateStatus(status: BookStatus): void {
    const currentBook = this.book();
    if (currentBook) {
      this.store.dispatch(BooksActions.updateBook({ id: currentBook.id, updates: { status } }));
    }
  }

  protected updateRating(rating: number): void {
    const currentBook = this.book();
    if (currentBook) {
      this.store.dispatch(BooksActions.updateBook({ id: currentBook.id, updates: { rating } }));
    }
  }

  protected addTag(): void {
    const tag = this.newTag().trim().toLowerCase();
    const currentBook = this.book();
    if (tag && currentBook) {
      const tags = [...(currentBook.tags || [])];
      if (!tags.includes(tag)) {
        tags.push(tag);
        this.store.dispatch(BooksActions.updateBook({ id: currentBook.id, updates: { tags } }));
        this.newTag.set('');
      }
    }
  }

  protected removeTag(tagToRemove: string): void {
    const currentBook = this.book();
    if (currentBook) {
      const tags = currentBook.tags?.filter(tag => tag !== tagToRemove) || [];
      this.store.dispatch(BooksActions.updateBook({ id: currentBook.id, updates: { tags } }));
    }
  }

  protected updateNotes(notes: string): void {
    const currentBook = this.book();
    if (currentBook) {
      this.store.dispatch(BooksActions.updateBook({ id: currentBook.id, updates: { notes } }));
    }
  }

  protected backToList(): void {
    this.router.navigate(['/personal-cabinet/books']);
  }
}
