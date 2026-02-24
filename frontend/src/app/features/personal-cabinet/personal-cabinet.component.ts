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
import { BookStatus } from '../../core/models/book.model';
import * as BooksActions from '../../shared/store/books/books.actions';
import { selectAllBooks, selectBooksLoading, selectLatestNote } from '../../shared/store/books/books.selectors';
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

  protected readonly books = toSignal(this.store.select(selectAllBooks), { initialValue: [] });
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });
  protected readonly latestNote = toSignal(this.store.select(selectLatestNote), { initialValue: null });

  private readonly SECTIONS: { type: BookStatus; title: string }[] = [
    { type: BookStatus.Reading, title: 'PERSONAL_CABINET.SECTION_READING' },
    { type: BookStatus.Planned, title: 'PERSONAL_CABINET.SECTION_PLANNED' },
    { type: BookStatus.Completed, title: 'PERSONAL_CABINET.SECTION_COMPLETED' },
    { type: BookStatus.Dropped, title: 'PERSONAL_CABINET.SECTION_DROPPED' },
  ];

  private readonly openSections = signal<Set<BookStatus>>(new Set());
  private readonly confirmDeleteModal = viewChild.required<TemplateRef<{ id: string }>>('confirmDeleteModal');

  protected readonly cabinetSections = computed(() =>
    this.SECTIONS.map(status => {
      const sectionBooks = this.books().filter(book => book.status === status.type);
      return {
        ...status,
        allBooksCount: sectionBooks.length,
        books: sectionBooks.slice(0, 3),
        isOpen: this.openSections().has(status.type),
      };
    })
  );

  ngOnInit(): void {
    this.store.dispatch(BooksActions.loadBooks({}));
    this.store.dispatch(BooksActions.loadLatestNote());
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
