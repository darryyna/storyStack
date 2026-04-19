import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeneralStats {
    totalBooks: number;
    booksRead: number;
    avgRating: number;
    totalCurrentPages: number;
    achievedGoals: number;
    topTags: { _id: string; count: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/statistics`;

    getGeneralStats(): Observable<GeneralStats> {
        return this.http.get<GeneralStats>(`${this.apiUrl}/general`);
    }

    getGenreStats(): Observable<{ _id: string; count: number }[]> {
        return this.http.get<{ _id: string; count: number }[]>(`${this.apiUrl}/genres`);
    }

    getAuthorStats(): Observable<{ _id: string; count: number }[]> {
        return this.http.get<{ _id: string; count: number }[]>(`${this.apiUrl}/authors`);
    }

    getActivityStats(period: 'month' | 'year' = 'month'): Observable<{ _id: string; pagesRead: number }[]> {
        return this.http.get<{ _id: string; pagesRead: number }[]>(`${this.apiUrl}/activity`, { params: { period } });
    }

    getBooksPerYearStats(): Observable<{ _id: number; count: number }[]> {
        return this.http.get<{ _id: number; count: number }[]>(`${this.apiUrl}/books-per-year`);
    }
}
