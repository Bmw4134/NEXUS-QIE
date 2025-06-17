
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventBus } from '@/lib/event-bus';
import { PromptDNAFingerprinting } from '@/lib/prompt-dna-fingerprinting';
import { ChartRenderer } from '@/lib/chart-renderer';
import { MetricsStreaming } from '@/lib/metrics-streaming';
import { FirebaseSync } from '@/lib/firebase-sync';
import { ValidationSystem } from '@/lib/validation-system';
import { GoalTracker } from '@/lib/goal-tracker';
import { WidgetCoordinator } from '@/lib/widget-coordinator';

interface KaizenContext {
  eventBus: EventBus;
  promptDNA: PromptDNAFingerprinting;
  chartRenderer: ChartRenderer;
  metricsStreaming: MetricsStreaming;
  firebaseSync: FirebaseSync;
  validationSystem: ValidationSystem;
  goalTracker: GoalTracker;
  widgetCoordinator: WidgetCoordinator;
  isInitialized: boolean;
}

const KaizenAssistantContext = createContext<KaizenContext | null>(null);

export const useKaizenAssistant = () => {
  const context = useContext(KaizenAssistantContext);
  if (!context) {
    throw new Error('useKaizenAssistant must be used within KaizenAssistantCore');
  }
  return context;
};

interface KaizenAssistantCoreProps {
  children: React.ReactNode;
  dashboard?: string;
  config?: {
    enableFirebaseSync?: boolean;
    enableMetricsStreaming?: boolean;
    enableDebugOverlay?: boolean;
    enableErrorOverlay?: boolean;
    enableStateSnapshot?: boolean;
    enableWidgetPerfTracker?: boolean;
  };
}

export const KaizenAssistantCore: React.FC<KaizenAssistantCoreProps> = ({
  children,
  dashboard = 'default',
  config = {}
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const systemRef = useRef<KaizenContext | null>(null);

  useEffect(() => {
    const initializeKaizenSystem = async () => {
      console.log('🚀 KaizenAssistantCore: Initializing system...');
      
      try {
        // Initialize core systems
        const eventBus = new EventBus();
        const promptDNA = new PromptDNAFingerprinting();
        const chartRenderer = new ChartRenderer();
        const metricsStreaming = new MetricsStreaming(eventBus);
        const firebaseSync = new FirebaseSync(config.enableFirebaseSync);
        const validationSystem = new ValidationSystem();
        const goalTracker = new GoalTracker();
        const widgetCoordinator = new WidgetCoordinator(eventBus);

        // Connect systems
        eventBus.subscribe('prompt_executed', (data) => {
          promptDNA.fingerprint(data.prompt, data.context);
          goalTracker.logGoal(data.goal);
        });

        eventBus.subscribe('chart_requested', (data) => {
          chartRenderer.render(data.chartType, data.data, data.container);
        });

        eventBus.subscribe('validation_required', (data) => {
          validationSystem.validate(data.output, data.schema);
        });

        if (config.enableFirebaseSync) {
          await firebaseSync.initialize();
          eventBus.subscribe('data_changed', (data) => {
            firebaseSync.sync(data);
          });
        }

        if (config.enableMetricsStreaming) {
          metricsStreaming.start();
        }

        systemRef.current = {
          eventBus,
          promptDNA,
          chartRenderer,
          metricsStreaming,
          firebaseSync,
          validationSystem,
          goalTracker,
          widgetCoordinator,
          isInitialized: true
        };

        setIsInitialized(true);
        
        // Emit system ready event
        eventBus.emit('kaizen_system_ready', { dashboard, timestamp: new Date() });
        
        console.log('✅ KaizenAssistantCore: System initialized successfully');
        
      } catch (error) {
        console.error('❌ KaizenAssistantCore: Initialization failed:', error);
      }
    };

    initializeKaizenSystem();

    return () => {
      if (systemRef.current) {
        systemRef.current.metricsStreaming.stop();
        systemRef.current.eventBus.removeAllListeners();
      }
    };
  }, [dashboard, config]);

  if (!isInitialized || !systemRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-bold">KaizenAssistantCore</h2>
          <p className="text-gray-400">Initializing Quantum Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <KaizenAssistantContext.Provider value={systemRef.current}>
      {children}
    </KaizenAssistantContext.Provider>
  );
};
