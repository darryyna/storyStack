import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Goal {
    id?: string;
    name: string;
    type: 'MONTH' | 'QUARTER' | 'HALF_YEAR' | 'YEAR' | 'CUSTOM';
    goalType: 'BOOKS_COUNT' | 'PAGES_COUNT';
    startDate: string | Date;
    endDate: string | Date;
    targetCount: number;
    currentCount?: number;
    progressPercent?: number;
    isAchieved?: boolean;
    category?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoalService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/goals`;

    getGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(this.apiUrl);
    }

    createGoal(goal: Goal): Observable<Goal> {
        return this.http.post<Goal>(this.apiUrl, goal);
    }

    deleteGoal(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
