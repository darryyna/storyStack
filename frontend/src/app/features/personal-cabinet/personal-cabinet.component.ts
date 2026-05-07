import { Component, inject, signal, computed, OnInit, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { AddBookModalComponent } from './components/add-book-modal/add-book-modal.component';
import { ModalWindowComponent } from '../../shared/components/modal-window/modal-window.component';
import { Book, BookStatus, ManualBookModalData, SearchBook } from '../../core/models/book.model';
import { ManualBookModalComponent } from './components/manual-book-modal/manual-book-modal.component';
import * as BooksActions from '../../shared/store/books/books.actions';
import { forkJoin } from 'rxjs';
import { BooksService } from '../../core/services/books.service';
import {
  selectAddedFromRecommendations, selectAddingFromRecommendations,
  selectBooksLoading,
  selectCountsByStatus,
  selectLatestNote, selectRecommendations, selectRecommendationsLoading,
} from '../../shared/store/books/books.selectors';
import { selectCurrentUser } from '../../shared/store/auth/auth.selectors';

@Component({
  selector: 'app-personal-cabinet',
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule, MatIconModule, ModalWindowComponent],
  standalone: true,
  templateUrl: './personal-cabinet.component.html',
  styleUrl: './personal-cabinet.component.scss'
})
export class PersonalCabinetComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  private readonly currentUser = toSignal(this.store.select(selectCurrentUser), { initialValue: undefined });
  protected readonly username = computed(() => this.currentUser()?.username ?? '');

  private readonly booksService = inject(BooksService);
  protected readonly previewBooks = signal<Partial<Record<BookStatus, Book[]>>>({});
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });
  protected readonly latestNote = toSignal(this.store.select(selectLatestNote), { initialValue: null });
  protected readonly recommendations = toSignal(
    this.store.select(selectRecommendations), { initialValue: [] }
  );
  protected readonly recommendationsLoading = toSignal(
    this.store.select(selectRecommendationsLoading), { initialValue: false }
  );
  protected readonly addedFromRecommendations = toSignal(
    this.store.select(selectAddedFromRecommendations), { initialValue: [] }
  );
  protected readonly addingFromRecommendations = toSignal(
    this.store.select(selectAddingFromRecommendations), { initialValue: [] }
  );

  protected addRecommendedBook(book: SearchBook, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(BooksActions.addBookFromRecommendation({ book }));
  }

  protected isRecommendationAdded(sourceId: string): boolean {
    return this.addedFromRecommendations().includes(sourceId);
  }

  protected isRecommendationAdding(sourceId: string): boolean {
    return this.addingFromRecommendations().includes(sourceId);
  }

  private readonly SECTIONS: { type: BookStatus; title: string }[] = [
    { type: BookStatus.Reading, title: 'PERSONAL_CABINET.SECTION_READING' },
    { type: BookStatus.Planned, title: 'PERSONAL_CABINET.SECTION_PLANNED' },
    { type: BookStatus.Completed, title: 'PERSONAL_CABINET.SECTION_COMPLETED' },
    { type: BookStatus.Dropped, title: 'PERSONAL_CABINET.SECTION_DROPPED' },
  ];

  private readonly openSections = signal<Set<BookStatus>>(new Set());
  private readonly confirmDeleteModal = viewChild.required<TemplateRef<{ id: string }>>('confirmDeleteModal');

  protected readonly cabinetSections = computed(() => {
    const counts = this.countsByStatus();
    const preview = this.previewBooks();

    return this.SECTIONS.map(section => ({
      ...section,
      allBooksCount: counts ? counts[section.type] : 0,
      books: preview[section.type] ?? [],
      isOpen: this.openSections().has(section.type),
    }));
  });

  protected readonly countsByStatus = toSignal(
    this.store.select(selectCountsByStatus),
    {
      initialValue: {
        [BookStatus.Reading]: 0,
        [BookStatus.Planned]: 0,
        [BookStatus.Completed]: 0,
        [BookStatus.Dropped]: 0,
      }
    }
  );

  ngOnInit(): void {
    forkJoin({
      reading:   this.booksService.getUserBooks({ status: BookStatus.Reading,   limit: 3 }),
      planned:   this.booksService.getUserBooks({ status: BookStatus.Planned,   limit: 3 }),
      completed: this.booksService.getUserBooks({ status: BookStatus.Completed, limit: 3 }),
      dropped:   this.booksService.getUserBooks({ status: BookStatus.Dropped,   limit: 3 }),
    }).subscribe(results => {
      this.previewBooks.set({
        [BookStatus.Reading]:   results.reading.books,
        [BookStatus.Planned]:   results.planned.books,
        [BookStatus.Completed]: results.completed.books,
        [BookStatus.Dropped]:   results.dropped.books,
      });
      this.store.dispatch(BooksActions.loadBooks({ filters: { limit: 1 } }));
    });

    this.store.dispatch(BooksActions.loadLatestNote());
    this.store.dispatch(BooksActions.loadRecommendations());
  }

  protected toggleSection(type: BookStatus): void {
    this.openSections.update(open => {
      const next = new Set(open);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  protected openAddBookModal(): void {
    this.dialog.open(AddBookModalComponent, {
      width: '600px',
      panelClass: 'add-book-dialog',
    }).afterClosed().subscribe((result: SearchBook | undefined) => {
      if (result) {
        this.openReviewModal(result);
      }
    });
  }

  protected openReviewModal(book: SearchBook): void {
    this.dialog.open(ManualBookModalComponent, {
      width: '600px',
      data: { book, isCustom: false } satisfies ManualBookModalData,
      autoFocus: false
    });
  }

  protected viewAll(status: BookStatus): void {
    this.router.navigate(['/personal-cabinet/books'], { queryParams: { status } });
  }

  protected viewBook(id: string): void {
    this.router.navigate(['/personal-cabinet/books', id]);
  }

  protected deleteBook(id: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(this.confirmDeleteModal(), {
      width: '400px',
      data: { id }
    });
  }

  protected onConfirmDelete(id: string): void {
    this.store.dispatch(BooksActions.deleteBook({ id }));
    this.dialog.closeAll();
  }

  protected onCancelDelete(): void {
    this.dialog.closeAll();
  }
}
