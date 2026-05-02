import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Goal } from '../../shared/models/goal.model';
import { GoalPredictionResponse } from '../../shared/models/prediction.model';

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

  getGoalPrediction(id: string): Observable<GoalPredictionResponse> {
    return this.http.get<GoalPredictionResponse>(`${this.apiUrl}/${id}/prediction`);
  }
}
