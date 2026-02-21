import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GoogleBook, Book, BookStatus } from '../models/book.model';
import { ExternalBookResponse } from '../../shared/models/book.model';

@Injectable({
    providedIn: 'root'
})
export class BooksService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/books`;

    public search(query: string): Observable<GoogleBook[]> {
        return this.http.get<GoogleBook[]>(`${this.apiUrl}/search`, { params: { q: query } });
    }

    public addExternalBook(book: GoogleBook): Observable<ExternalBookResponse> {
        const payload = {
            sourceId: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors,
            thumbnail: book.volumeInfo.imageLinks?.thumbnail
        };
        return this.http.post<ExternalBookResponse>(`${this.apiUrl}/external`, payload);
    }

    public addUserBook(externalBookId: string, status: BookStatus = BookStatus.Planned): Observable<Book> {
        return this.http.post<Book>(`${this.apiUrl}/user-books`, { externalBookId, status });
    }

    public getUserBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(`${this.apiUrl}/user-books`);
    }
}
