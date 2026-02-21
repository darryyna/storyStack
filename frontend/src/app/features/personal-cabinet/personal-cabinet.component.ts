import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { AddBookModalComponent } from './components/add-book-modal/add-book-modal.component';
import { BookStatus } from '../../core/models/book.model';
import * as BooksActions from '../../shared/store/books/books.actions';
import { selectAllBooks, selectBooksLoading } from '../../shared/store/books/books.selectors';
import { selectCurrentUser } from '../../shared/store/auth/auth.selectors';

@Component({
  selector: 'app-personal-cabinet',
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule, MatIconModule],
  standalone: true,
  templateUrl: './personal-cabinet.component.html',
  styleUrl: './personal-cabinet.component.scss'
})
export class PersonalCabinetComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  private readonly currentUser = toSignal(this.store.select(selectCurrentUser), { initialValue: undefined });
  protected readonly username = computed(() => this.currentUser()?.username ?? '');

  protected readonly books = toSignal(this.store.select(selectAllBooks), { initialValue: [] });
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });

  private readonly SECTIONS: { type: BookStatus; title: string }[] = [
    { type: BookStatus.Reading, title: 'In Progress' },
    { type: BookStatus.Planned, title: 'Want to Read' },
    { type: BookStatus.Completed, title: 'Completed' },
    { type: BookStatus.Dropped, title: 'Abandoned' },
  ];

  private readonly openSections = signal<Set<BookStatus>>(new Set());

  protected readonly cabinetSections = computed(() =>
    this.SECTIONS.map(s => ({
      ...s,
      books: this.books().filter(b => b.status === s.type),
      isOpen: this.openSections().has(s.type),
    }))
  );

  protected readonly lastPick = signal({
    bookTitle: 'The Pragmatic Programmer',
    lastNote: 'Great insight on orthogonality in chapter 2.',
    timestamp: new Date(),
  });

  ngOnInit(): void {
    this.store.dispatch(BooksActions.loadBooks());
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
}
