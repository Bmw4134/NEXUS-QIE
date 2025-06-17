
export interface PerformanceMetric {
  widgetId: string;
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  timestamp: Date;
}

export class WidgetPerfTracker {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private renderStartTimes: Map<string, number> = new Map();

  startRenderTracking(widgetId: string): void {
    this.renderStartTimes.set(widgetId, performance.now());
  }

  endRenderTracking(widgetId: string): void {
    const startTime = this.renderStartTimes.get(widgetId);
    if (startTime) {
      const renderTime = performance.now() - startTime;
      this.recordMetric(widgetId, { renderTime });
      this.renderStartTimes.delete(widgetId);
    }
  }

  recordMetric(widgetId: string, metric: Partial<PerformanceMetric>): void {
    const fullMetric: PerformanceMetric = {
      widgetId,
      renderTime: metric.renderTime || 0,
      updateTime: metric.updateTime || 0,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date()
    };

    if (!this.metrics.has(widgetId)) {
      this.metrics.set(widgetId, []);
    }

    const widgetMetrics = this.metrics.get(widgetId)!;
    widgetMetrics.push(fullMetric);

    // Keep only last 50 metrics per widget
    if (widgetMetrics.length > 50) {
      widgetMetrics.shift();
    }
  }

  getMetrics(widgetId: string): PerformanceMetric[] {
    return this.metrics.get(widgetId) || [];
  }

  getAllMetrics(): Map<string, PerformanceMetric[]> {
    return new Map(this.metrics);
  }

  getAverageRenderTime(widgetId: string): number {
    const metrics = this.getMetrics(widgetId);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.renderTime, 0);
    return total / metrics.length;
  }

  getSlowestWidgets(limit: number = 5): Array<{ widgetId: string; avgRenderTime: number }> {
    const avgTimes = Array.from(this.metrics.keys()).map(widgetId => ({
      widgetId,
      avgRenderTime: this.getAverageRenderTime(widgetId)
    }));

    return avgTimes
      .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      .slice(0, limit);
  }

  private getMemoryUsage(): number {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  clearMetrics(widgetId?: string): void {
    if (widgetId) {
      this.metrics.delete(widgetId);
    } else {
      this.metrics.clear();
    }
  }
}

// Global instance
export const widgetPerfTracker = new WidgetPerfTracker();
