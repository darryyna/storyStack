import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { forkJoin } from 'rxjs';
import { GeneralStats, ReadingInsights, ReadingRecord, ReadingStreak } from '../../shared/models/statistic.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatIconModule, TranslateModule, LoaderComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  private readonly statsService = inject(StatisticsService);

  protected stats     = signal<GeneralStats | null>(null);
  protected record    = signal<ReadingRecord | null>(null);
  protected streak    = signal<ReadingStreak | null>(null);
  protected insights  = signal<ReadingInsights | null>(null);
  protected isLoading = signal(true);

  protected activityPeriod = signal<'month' | 'year'>('month');

  protected activityChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Pages Read', backgroundColor: '#6d4aff' }]
  };
  protected activityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 6 } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 10, maxRotation: 45 } }
    },
    plugins: { legend: { display: false } }
  };

  protected genreChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#6d4aff', '#ff4a6d', '#4aff6d', '#ffcc4a', '#4accff', '#a891ff', '#ff91a8', '#91ffa8'] }]
  };

  protected yearChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Books Read',
      backgroundColor: (ctx) => {
        const labels = ctx.chart.data.labels as string[];
        const currentYear = new Date().getFullYear().toString();
        return labels?.[ctx.dataIndex] === currentYear ? '#6d4aff' : 'rgba(109,74,255,0.35)';
      },
      borderRadius: 6,
    }]
  };

  protected yearChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
    },
    plugins: { legend: { display: false } }
  };

  ngOnInit(): void {
    this.loadAllStats();
  }

  protected switchPeriod(period: 'month' | 'year'): void {
    this.activityPeriod.set(period);
    this.statsService.getActivityStats(period).subscribe(activity => {
      if (activity) this.updateActivityChart(activity);
    });
  }

  private updateActivityChart(activity: { _id: string; pagesRead: number }[]): void {
    this.activityChartData = {
      labels: activity.map(a => a._id),
      datasets: [{ data: activity.map(a => a.pagesRead), label: 'Pages Read', backgroundColor: '#6d4aff' }]
    };
  }

  private loadAllStats(): void {
    this.isLoading.set(true);

    forkJoin({
      general:  this.statsService.getGeneralStats(),
      genres:   this.statsService.getGenreStats(),
      activity: this.statsService.getActivityStats('month'),
      years:    this.statsService.getBooksPerYearStats(),
      record:   this.statsService.getReadingRecord(),
      streak:   this.statsService.getReadingStreak(),
      insights: this.statsService.getInsights(),
    }).subscribe({
      next: ({ general, genres, activity, years, record, streak, insights }) => {
        this.stats.set(general || null);
        this.record.set(record || null);
        this.streak.set(streak || null);
        this.insights.set(insights || null);

        if (genres?.length) {
          this.genreChartData = {
            labels: genres.map(g => g._id),
            datasets: [{
              data: genres.map(g => g.count),
              backgroundColor: ['#6d4aff', '#ff4a6d', '#4aff6d', '#ffcc4a', '#4accff', '#a891ff', '#ff91a8', '#91ffa8']
            }]
          };
        }

        if (activity?.length) this.updateActivityChart(activity);

        if (years?.length) {
          this.yearChartData = {
            labels: years.map(y => y._id.toString()),
            datasets: [{
              data: years.map(y => y.count),
              label: 'Books Read',
              backgroundColor: (ctx) => {
                const labels = ctx.chart.data.labels as string[];
                const currentYear = new Date().getFullYear().toString();
                return labels?.[ctx.dataIndex] === currentYear ? '#6d4aff' : 'rgba(109,74,255,0.35)';
              },
              borderRadius: 6,
            }]
          };
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.isLoading.set(false);
      }
    });
  }

  protected formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
