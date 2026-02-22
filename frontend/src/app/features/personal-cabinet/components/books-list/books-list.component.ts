import { Component, inject, signal, OnInit, effect, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectAllBooks, selectBooksLoading } from '../../../../shared/store/books/books.selectors';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { BookStatus, BookFilters } from '../../../../core/models/book.model';
import { ModalWindowComponent } from '../../../../shared/components/modal-window/modal-window.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatButtonModule, MatIconModule, MatDialogModule, ModalWindowComponent, FormsModule, LoaderComponent],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.scss'
})
export class BooksListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly books = toSignal(this.store.select(selectAllBooks), { initialValue: [] });
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });

  protected readonly statuses = Object.values(BookStatus);
  protected readonly ratings = [1, 2, 3, 4, 5];
  private confirmDeleteModal = viewChild.required<TemplateRef<{ id: string }>>('confirmDeleteModal');

  protected statusFilter = signal<string>('');
  protected ratingFilter = signal<number | null>(null);
  protected tagFilter = signal<string>('');

  constructor() {
    effect(() => {
      const filters: BookFilters = {};
      const urlParams: Record<string, string | number | string[] | null> = {};

      if (this.statusFilter()) {
        filters.status = this.statusFilter();
        urlParams['status'] = filters.status;
      } else {
        urlParams['status'] = null;
      }

      if (this.ratingFilter()) {
        const rating = this.ratingFilter()!;
        filters.rating = rating;
        urlParams['rating'] = rating;
      } else {
        urlParams['rating'] = null;
      }

      if (this.tagFilter()) {
        const tags = this.tagFilter().split(',').map(tag => tag.trim()).filter(tag => !!tag);
        if (tags.length > 0) {
          filters.tags = tags;
          urlParams['tags'] = tags;
        } else {
          urlParams['tags'] = null;
        }
      } else {
        urlParams['tags'] = null;
      }

      this.store.dispatch(BooksActions.loadBooks({ filters }));
      this.updateUrl(urlParams);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['status']) this.statusFilter.set(params['status']);
    if (params['rating']) this.ratingFilter.set(Number(params['rating']));
    if (params['tags']) this.tagFilter.set(Array.isArray(params['tags']) ? params['tags'].join(', ') : params['tags']);
  }

  protected resetFilters(): void {
    this.statusFilter.set('');
    this.ratingFilter.set(null);
    this.tagFilter.set('');
  }

  private updateUrl(params: Record<string, string | number | string[] | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  protected deleteBook(id: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(this.confirmDeleteModal(), {
      width: '400px',
      data: { id }
    });
  }

  protected viewBook(id: string): void {
    this.router.navigate(['/personal-cabinet/books', id]);
  }

  protected onConfirmDelete(id: string): void {
    this.store.dispatch(BooksActions.deleteBook({ id }));
    this.dialog.closeAll();
  }

  protected onCancelDelete(): void {
    this.dialog.closeAll();
  }

  protected backToCabinet(): void {
    this.router.navigate(['/personal-cabinet']);
  }
}
