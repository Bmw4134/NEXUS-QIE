
import { EventBus } from './event-bus';

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export class MetricsStreaming {
  private isStreaming = false;
  private interval: NodeJS.Timeout | null = null;
  private metrics: Metric[] = [];

  constructor(private eventBus: EventBus) {}

  start(intervalMs: number = 5000): void {
    if (this.isStreaming) return;

    this.isStreaming = true;
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    console.log('📊 MetricsStreaming: Started');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isStreaming = false;
    console.log('📊 MetricsStreaming: Stopped');
  }

  addMetric(metric: Metric): void {
    this.metrics.push(metric);
    this.eventBus.emit('metric_collected', metric);
  }

  getMetrics(name?: string): Metric[] {
    return name 
      ? this.metrics.filter(m => m.name === name)
      : [...this.metrics];
  }

  private collectMetrics(): void {
    // Performance metrics
    if (performance.memory) {
      this.addMetric({
        name: 'memory_used',
        value: performance.memory.usedJSHeapSize,
        timestamp: new Date(),
        tags: { type: 'memory' }
      });

      this.addMetric({
        name: 'memory_total',
        value: performance.memory.totalJSHeapSize,
        timestamp: new Date(),
        tags: { type: 'memory' }
      });
    }

    // DOM metrics
    this.addMetric({
      name: 'dom_elements',
      value: document.getElementsByTagName('*').length,
      timestamp: new Date(),
      tags: { type: 'dom' }
    });

    // Connection metrics
    if (navigator.connection) {
      const connection = navigator.connection as any;
      this.addMetric({
        name: 'network_downlink',
        value: connection.downlink || 0,
        timestamp: new Date(),
        tags: { type: 'network' }
      });
    }

    // Emit aggregated metrics
    this.eventBus.emit('metrics_update', {
      timestamp: new Date(),
      metrics: this.getRecentMetrics()
    });
  }

  private getRecentMetrics(): Metric[] {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > fiveMinutesAgo);
  }
}
