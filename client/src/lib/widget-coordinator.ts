
import { EventBus } from './event-bus';

export interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
  zIndex: number;
}

export class WidgetCoordinator {
  private widgets: Map<string, Widget> = new Map();
  private dragState: { isDragging: boolean; widgetId?: string } = { isDragging: false };

  constructor(private eventBus: EventBus) {
    this.setupEventListeners();
  }

  registerWidget(widget: Widget): void {
    this.widgets.set(widget.id, widget);
    this.eventBus.emit('widget_registered', widget);
    console.log(`🔧 Widget registered: ${widget.id}`);
  }

  unregisterWidget(widgetId: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      this.widgets.delete(widgetId);
      this.eventBus.emit('widget_unregistered', { widgetId });
      console.log(`🔧 Widget unregistered: ${widgetId}`);
    }
  }

  updateWidget(widgetId: string, updates: Partial<Widget>): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      Object.assign(widget, updates);
      this.eventBus.emit('widget_updated', { widgetId, widget });
    }
  }

  moveWidget(widgetId: string, position: { x: number; y: number }): void {
    this.updateWidget(widgetId, { position });
  }

  resizeWidget(widgetId: string, size: { width: number; height: number }): void {
    this.updateWidget(widgetId, { size });
  }

  showWidget(widgetId: string): void {
    this.updateWidget(widgetId, { isVisible: true });
  }

  hideWidget(widgetId: string): void {
    this.updateWidget(widgetId, { isVisible: false });
  }

  bringToFront(widgetId: string): void {
    const maxZ = Math.max(...Array.from(this.widgets.values()).map(w => w.zIndex));
    this.updateWidget(widgetId, { zIndex: maxZ + 1 });
  }

  getWidget(widgetId: string): Widget | undefined {
    return this.widgets.get(widgetId);
  }

  getAllWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }

  getVisibleWidgets(): Widget[] {
    return this.getAllWidgets().filter(w => w.isVisible);
  }

  private setupEventListeners(): void {
    // Handle drag start
    this.eventBus.subscribe('widget_drag_start', (data) => {
      this.dragState = { isDragging: true, widgetId: data.widgetId };
      this.bringToFront(data.widgetId);
    });

    // Handle drag end
    this.eventBus.subscribe('widget_drag_end', () => {
      this.dragState = { isDragging: false };
    });

    // Handle widget interactions
    this.eventBus.subscribe('widget_interaction', (data) => {
      const widget = this.getWidget(data.widgetId);
      if (widget) {
        this.eventBus.emit('widget_action', {
          widget,
          action: data.action,
          payload: data.payload
        });
      }
    });
  }

  arrangeWidgets(layout: 'grid' | 'cascade' | 'stack'): void {
    const visibleWidgets = this.getVisibleWidgets();
    
    switch (layout) {
      case 'grid':
        this.arrangeInGrid(visibleWidgets);
        break;
      case 'cascade':
        this.arrangeInCascade(visibleWidgets);
        break;
      case 'stack':
        this.arrangeInStack(visibleWidgets);
        break;
    }
  }

  private arrangeInGrid(widgets: Widget[]): void {
    const cols = Math.ceil(Math.sqrt(widgets.length));
    const cellWidth = window.innerWidth / cols;
    const cellHeight = window.innerHeight / Math.ceil(widgets.length / cols);

    widgets.forEach((widget, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      this.updateWidget(widget.id, {
        position: { x: col * cellWidth, y: row * cellHeight },
        size: { width: cellWidth - 10, height: cellHeight - 10 }
      });
    });
  }

  private arrangeInCascade(widgets: Widget[]): void {
    widgets.forEach((widget, index) => {
      this.updateWidget(widget.id, {
        position: { x: index * 30, y: index * 30 },
        zIndex: index
      });
    });
  }

  private arrangeInStack(widgets: Widget[]): void {
    widgets.forEach((widget, index) => {
      this.updateWidget(widget.id, {
        position: { x: 0, y: 0 },
        zIndex: index,
        isVisible: index === widgets.length - 1 // Only show top widget
      });
    });
  }
}
