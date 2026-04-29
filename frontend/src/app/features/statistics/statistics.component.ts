import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService, GeneralStats } from '../../core/services/statistics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatIconModule, TranslateModule, LoaderComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  private statsService = inject(StatisticsService);

  protected stats = signal<GeneralStats | null>(null);
  protected isLoading = signal(true);

  protected activityChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Pages Read', backgroundColor: '#6d4aff' }]
  };
  protected activityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  protected genreChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#6d4aff', '#ff4a6d', '#4aff6d', '#ffcc4a', '#4accff'] }]
  };

  protected yearChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Books Read',
      borderColor: '#6d4aff',
      backgroundColor: 'rgba(109,74,255,0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  ngOnInit(): void {
    this.loadAllStats();
  }

  private loadAllStats(): void {
    this.isLoading.set(true);

    forkJoin({
      general: this.statsService.getGeneralStats(),
      genres: this.statsService.getGenreStats(),
      activity: this.statsService.getActivityStats('month'),
      years: this.statsService.getBooksPerYearStats()
    }).subscribe({
      next: ({ general, genres, activity, years }) => {
        this.stats.set(general || null);

        if (genres) {
          this.genreChartData = {
            labels: genres.map(g => g._id),
            datasets: [{
              data: genres.map(g => g.count),
              backgroundColor: ['#6d4aff', '#ff4a6d', '#4aff6d', '#ffcc4a', '#4accff', '#a891ff', '#ff91a8', '#91ffa8']
            }]
          };
        }

        if (activity) {
          this.activityChartData = {
            labels: activity.map(a => a._id),
            datasets: [{ data: activity.map(a => a.pagesRead), label: 'Pages Read', backgroundColor: '#6d4aff' }]
          };
        }

        if (years) {
          this.yearChartData = {
            labels: years.map(y => y._id.toString()),
            datasets: [{
              data: years.map(y => y.count),
              label: 'Books Read',
              borderColor: '#6d4aff',
              backgroundColor: 'rgba(109,74,255,0.1)',
              fill: true,
              tension: 0.4
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
}
