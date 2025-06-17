
import { Chart, ChartConfiguration } from 'chart.js/auto';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export class ChartRenderer {
  private charts: Map<string, Chart> = new Map();

  render(
    chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter',
    data: ChartData,
    container: string | HTMLCanvasElement
  ): Chart {
    const canvas = typeof container === 'string' 
      ? document.getElementById(container) as HTMLCanvasElement
      : container;

    if (!canvas) {
      throw new Error(`Chart container not found: ${container}`);
    }

    // Destroy existing chart if it exists
    const existingChart = this.charts.get(canvas.id);
    if (existingChart) {
      existingChart.destroy();
    }

    const config: ChartConfiguration = {
      type: chartType,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white'
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        } : undefined
      }
    };

    const chart = new Chart(canvas, config);
    this.charts.set(canvas.id, chart);

    return chart;
  }

  updateChart(chartId: string, newData: ChartData): void {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.data = newData;
      chart.update();
    }
  }

  destroyChart(chartId: string): void {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }

  destroyAllCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}
