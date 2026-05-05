import { Component, inject, signal, OnInit, effect, viewChild, TemplateRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { selectAllBooks, selectBooksLoading, selectTotalPages, selectCurrentPage, selectTotalCount } from '../../../../shared/store/books/books.selectors';
import * as BooksActions from '../../../../shared/store/books/books.actions';
import { BookStatus, BookFilters } from '../../../../core/models/book.model';
import { ModalWindowComponent } from '../../../../shared/components/modal-window/modal-window.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';
import { FormsModule } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Folder } from '../../../../core/models/folder.model';
import { CreateFolderModalComponent } from '../create-folder-modal/create-folder-modal.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import * as FoldersActions from '../../../../shared/store/folders/folders.actions';
import { selectAllFolders } from '../../../../shared/store/folders/folders.selectors';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule, MatDialogModule, ModalWindowComponent, FormsModule, LoaderComponent, ResolveUrlPipe],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.scss'
})
export class BooksListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly actions$ = inject(Actions);

  protected readonly books = toSignal(this.store.select(selectAllBooks), { initialValue: [] });
  protected readonly folders = toSignal(this.store.select(selectAllFolders), { initialValue: [] });
  protected readonly isLoading = toSignal(this.store.select(selectBooksLoading), { initialValue: false });
  protected readonly totalPages = toSignal(this.store.select(selectTotalPages), { initialValue: 0 });
  protected readonly currentPage = toSignal(this.store.select(selectCurrentPage), { initialValue: 1 });
  protected readonly totalCount = toSignal(this.store.select(selectTotalCount), { initialValue: 0 });

  protected readonly statuses = Object.values(BookStatus);
  protected readonly ratings = [1, 2, 3, 4, 5];
  private confirmDeleteModal = viewChild.required<TemplateRef<{ id: string }>>('confirmDeleteModal');

  protected statusFilter = signal<string>('');
  protected ratingFilter = signal<number | null>(null);
  protected tagFilter = signal<string>('');
  protected searchFilter = signal<string>('');
  protected pageFilter = signal<number>(1);
  private searchSubject = new Subject<string>();
  protected selectedBookIds = signal<Set<string>>(new Set());
  protected showFolderDropdown = signal<boolean>(false);
  protected showCreateFolderModal = signal<boolean>(false);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(value => {
      this.searchFilter.set(value);
    });

    effect(() => {
      const filters: BookFilters = {
        page: this.pageFilter(),
        limit: 10
      };

      const urlParams: Record<string, string | number | string[] | null> = {
        page: filters.page!
      };

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

      if (this.searchFilter()) {
        filters.search = this.searchFilter();
        urlParams['search'] = filters.search;
      } else {
        urlParams['search'] = null;
      }

      this.store.dispatch(BooksActions.loadBooks({ filters }));
      this.updateUrl(urlParams);
    }, { allowSignalWrites: true });

    effect(() => {
      this.statusFilter();
      this.ratingFilter();
      this.tagFilter();
      this.searchFilter();
      untracked(() => this.pageFilter.set(1));
    }, { allowSignalWrites: true });

    this.actions$.pipe(
      ofType(BooksActions.deleteBookSuccess),
      takeUntilDestroyed()
    ).subscribe(() => {
      const filters: BookFilters = {
        page: this.pageFilter(),
        limit: 10,
        ...(this.statusFilter() && { status: this.statusFilter() }),
        ...(this.ratingFilter() && { rating: this.ratingFilter()! }),
        ...(this.tagFilter() && { tags: this.tagFilter().split(',').map(t => t.trim()).filter(Boolean) })
      };
      this.store.dispatch(BooksActions.loadBooks({ filters }));
    });
  }

  protected onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['status']) this.statusFilter.set(params['status']);
    if (params['rating']) this.ratingFilter.set(Number(params['rating']));
    if (params['tags']) this.tagFilter.set(Array.isArray(params['tags']) ? params['tags'].join(', ') : params['tags']);
    if (params['page']) this.pageFilter.set(Number(params['page']));
    this.store.dispatch(FoldersActions.loadFolders());
  }

  protected toggleSelectAll(event: Event) {
  const target = event.target as HTMLInputElement;
  const checked = target.checked;
  if (checked) {
    this.selectedBookIds.set(new Set(this.books().map(b => b.id!)));
  } else {
    this.selectedBookIds.set(new Set());
  }
}

  protected toggleSelectBook(id: string) {
    const selected = new Set(this.selectedBookIds());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedBookIds.set(selected);
  }

  protected isBookSelected(id: string): boolean {
    return this.selectedBookIds().has(id);
  }

  protected get isAllSelected(): boolean {
    return this.books().length > 0 && this.selectedBookIds().size === this.books().length;
  }

  protected toggleFolderDropdown() {
    this.showFolderDropdown.update(v => !v);
  }

  protected addToFolder(folderId: string | null) {
    const bookIds = Array.from(this.selectedBookIds());
    if (bookIds.length === 0) return;

    if (folderId === null) {
      bookIds.forEach(bookId => {
        const book = this.books().find(b => b.id === bookId);
        if (book?.folderId?.id) {
          this.store.dispatch(FoldersActions.removeBooksFromFolder({
            folderId: book.folderId.id,
            bookIds: [bookId]
          }));
        }
      });
    } else {
      this.store.dispatch(FoldersActions.addBooksToFolder({ folderId, bookIds }));
    }

    this.selectedBookIds.set(new Set());
    this.showFolderDropdown.set(false);
  }

  protected removeFromFolder(bookId: string, event: Event) {
    event.stopPropagation();
    const book = this.books().find(b => b.id === bookId);
    if (!book?.folderId?.id) return;
    this.store.dispatch(FoldersActions.removeBooksFromFolder({
      folderId: book.folderId.id,
      bookIds: [bookId]
    }));
  }

  protected openCreateFolderModal() {
    this.dialog.open(CreateFolderModalComponent, {
      width: '100%',
      maxWidth: '500px',
      panelClass: 'responsive-dialog',
      autoFocus: false
    }).afterClosed().subscribe((result: Folder | undefined) => {
      if (result) {
        const bookIds = Array.from(this.selectedBookIds());
        this.store.dispatch(FoldersActions.createFolder({ folder: { ...result, bookIds } }));
        this.selectedBookIds.set(new Set());
      }
    });
    this.showFolderDropdown.set(false);
  }

  protected resetFilters(): void {
    this.statusFilter.set('');
    this.ratingFilter.set(null);
    this.tagFilter.set('');
    this.pageFilter.set(1);
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageFilter.set(page);
    }
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

  protected deleteFolder(id: string, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(FoldersActions.deleteFolder({ id }));
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
    if (this.statusFilter().startsWith('folder:')) {
      this.statusFilter.set('');
    } else {
      this.router.navigate(['/personal-cabinet']);
    }
  }
}
