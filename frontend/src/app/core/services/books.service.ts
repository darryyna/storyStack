import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchBook, Book, BookStatus, BookFilters, PaginatedBooksResponse } from '../models/book.model';
import { ExternalBookResponse } from '../../shared/models/book.model';

@Injectable({
    providedIn: 'root'
})
export class BooksService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/books`;

    public search(query: string): Observable<SearchBook[]> {
        return this.http.get<SearchBook[]>(`${this.apiUrl}/search`, { params: { q: query } });
    }

    public addExternalBook(book: SearchBook): Observable<ExternalBookResponse> {
        const payload = {
            sourceId: book.id,
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
            description: book.description,
            pageCount: book.pageCount,
            categories: book.categories
        };
        return this.http.post<ExternalBookResponse>(`${this.apiUrl}/external`, payload);
    }

    public addUserBook(externalBookId: string, status: BookStatus = BookStatus.Planned): Observable<Book> {
        return this.http.post<Book>(`${this.apiUrl}/user-books`, { externalBookId, status });
    }

    public getUserBooks(filters?: BookFilters): Observable<PaginatedBooksResponse> {
        const params: Record<string, string | number | string[]> = {};
        if (filters) {
            if (filters.status) params['status'] = filters.status;
            if (filters.rating !== undefined) params['rating'] = filters.rating;
            if (filters.tags) params['tags'] = filters.tags;
            if (filters.page) params['page'] = filters.page.toString();
            if (filters.limit) params['limit'] = filters.limit.toString();
        }
        return this.http.get<PaginatedBooksResponse>(`${this.apiUrl}/user-books`, { params: params as Record<string, string | number | readonly string[]> });
    }

    public getBookById(id: string): Observable<Book> {
        return this.http.get<Book>(`${this.apiUrl}/user-books/${id}`);
    }

    public updateBook(id: string, updates: Partial<Book>): Observable<Book> {
        return this.http.patch<Book>(`${this.apiUrl}/user-books/${id}`, updates);
    }

    public getLatestNote(): Observable<{ bookId: string; bookTitle: string; lastNote: string; timestamp: string }> {
        return this.http.get<{ bookId: string; bookTitle: string; lastNote: string; timestamp: string }>(`${this.apiUrl}/user-books/latest-note`);
    }

    public deleteUserBook(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/user-books/${id}`);
    }

    public uploadCover(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('cover', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload-cover`, formData);
    }

    public addManualBook(bookData: Partial<SearchBook>): Observable<ExternalBookResponse> {
        return this.http.post<ExternalBookResponse>(`${this.apiUrl}/manual`, bookData);
    }

  public getRecommendations(): Observable<SearchBook[]> {
    return this.http.get<SearchBook[]>(`${this.apiUrl}/user-books/recommendations`);
  }

  public updateReadingProgress(id: string, pagesRead: number): Observable<{ userBook: Book; log: unknown }> {
    return this.http.patch<{ userBook: Book; log: unknown }>(`${this.apiUrl}/user-books/${id}/progress`, { pagesRead });
  }
}
