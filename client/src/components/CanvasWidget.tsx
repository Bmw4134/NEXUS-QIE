import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Kanban,
  Users, 
  Zap,
  ArrowRight,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';

interface CanvasWidgetProps {
  variant?: 'dashboard' | 'full';
  theme?: 'nexus' | 'trello' | 'minimal';
}

export default function CanvasWidget({ variant = 'dashboard', theme = 'nexus' }: CanvasWidgetProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Canvas data
  const { data: boardsData } = useQuery({
    queryKey: ['/api/canvas/boards'],
    refetchInterval: 10000
  });

  const { data: syncStatus } = useQuery({
    queryKey: ['/api/qnis/sync-status'],
    refetchInterval: 5000
  });

  const { data: enhancedCards } = useQuery({
    queryKey: ['/api/qnis/enhanced-cards'],
    refetchInterval: 8000
  });

  // Quick sync mutation
  const quickSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/qnis/sync-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'TRAXOVO-NEXUS',
          targets: ['ALL'],
          canvasType: 'kanban',
          enhanceUX: true,
          secureMount: true
        })
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Canvas Sync Complete",
        description: "NEXUS Canvas synchronized successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/qnis/sync-status'] });
    }
  });

  const boards = boardsData?.boards || [];
  const totalCards = boards.reduce((total: number, board: any) => 
    total + board.columns.reduce((colTotal: number, col: any) => colTotal + col.cards.length, 0), 0
  );
  const activeBoards = boards.filter((board: any) => board.type === 'kanban' || board.type === 'family-board').length;

  const getThemeClasses = () => {
    switch (theme) {
      case 'trello':
        return {
          container: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
          card: 'bg-white/15 border-blue-300/30 hover:bg-white/20',
          accent: 'text-blue-200',
          button: 'bg-blue-500 hover:bg-blue-600',
          badge: 'bg-blue-400/20 border-blue-400 text-blue-300'
        };
      case 'nexus':
        return {
          container: 'bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800',
          card: 'bg-white/10 border-purple-300/30 hover:bg-white/15',
          accent: 'text-purple-200',
          button: 'bg-purple-500 hover:bg-purple-600',
          badge: 'bg-purple-400/20 border-purple-400 text-purple-300'
        };
      default:
        return {
          container: 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800',
          card: 'bg-white/10 border-gray-300/30 hover:bg-white/15',
          accent: 'text-gray-200',
          button: 'bg-gray-500 hover:bg-gray-600',
          badge: 'bg-gray-400/20 border-gray-400 text-gray-300'
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (variant === 'dashboard') {
    return (
      <Card className={`${themeClasses.card} backdrop-blur-sm`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-purple-400" />
            NEXUS Canvas Boards
            <Badge className={themeClasses.badge}>
              {theme.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription className={themeClasses.accent}>
            Interactive Kanban management with real-time sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeBoards}</div>
              <div className="text-sm text-gray-300">Active Boards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalCards}</div>
              <div className="text-sm text-gray-300">Total Cards</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Sync Status</span>
              <Badge className={`${
                syncStatus?.activeSyncs > 0 
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-blue-500/20 border-blue-500 text-blue-400'
              }`}>
                {syncStatus?.activeSyncs > 0 ? 'SYNCING' : 'READY'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Enhanced Cards</span>
              <span className="text-white font-medium">{enhancedCards?.aiEnhanced || 0}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Canvas Health</span>
                <span className="text-green-400">98.7%</span>
              </div>
              <Progress value={98.7} className="h-2 bg-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              className={`${themeClasses.button} text-white`}
              onClick={() => quickSyncMutation.mutate()}
              disabled={quickSyncMutation.isPending}
            >
              <Zap className="w-3 h-3 mr-1" />
              {quickSyncMutation.isPending ? 'Syncing...' : 'Quick Sync'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setLocation('/canvas-boards')}
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              Open Canvas
            </Button>
          </div>

          {boards.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-sm text-gray-300 mb-2">Recent Boards</div>
              <div className="space-y-1">
                {boards.slice(0, 3).map((board: any) => (
                  <div key={board.id} className="flex items-center justify-between text-xs">
                    <span className="text-white truncate">{board.name}</span>
                    <Badge variant="outline" className="bg-gray-700/50 border-gray-600 text-gray-300">
                      {board.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${themeClasses.container} rounded-lg p-6 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Kanban className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">NEXUS Canvas System</h2>
            <p className={`${themeClasses.accent} text-sm`}>Enhanced Trello-style board management</p>
          </div>
        </div>
        <Badge className={`${themeClasses.badge} text-lg px-3 py-1`}>
          {theme.toUpperCase()} THEME
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className={themeClasses.card}>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{activeBoards}</div>
            <div className="text-sm text-gray-300">Active Boards</div>
          </CardContent>
        </Card>

        <Card className={themeClasses.card}>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalCards}</div>
            <div className="text-sm text-gray-300">Total Cards</div>
          </CardContent>
        </Card>

        <Card className={themeClasses.card}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{enhancedCards?.aiEnhanced || 0}</div>
            <div className="text-sm text-gray-300">AI Enhanced</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={themeClasses.card}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Board Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {boards.slice(0, 4).map((board: any) => (
              <div key={board.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div>
                  <div className="text-white font-medium text-sm">{board.name}</div>
                  <div className="text-gray-400 text-xs">{board.members.length} members</div>
                </div>
                <Badge className={`${
                  board.type === 'family-board' ? 'bg-green-500/20 border-green-500 text-green-400' :
                  board.type === 'kanban' ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
                  'bg-purple-500/20 border-purple-500 text-purple-400'
                }`}>
                  {board.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={themeClasses.card}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Sync Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Last Sync</span>
              <span className="text-white text-sm">
                {syncStatus?.lastUpdate ? new Date(syncStatus.lastUpdate).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active Syncs</span>
              <Badge className={`${
                syncStatus?.activeSyncs > 0 
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-gray-500/20 border-gray-500 text-gray-400'
              }`}>
                {syncStatus?.activeSyncs || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Secure Mount</span>
              <Badge className="bg-purple-500/20 border-purple-500 text-purple-400">
                ENABLED
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-6">
        <Button 
          className={`${themeClasses.button} text-white flex-1`}
          onClick={() => setLocation('/canvas-boards')}
        >
          <Kanban className="w-4 h-4 mr-2" />
          Open Canvas Boards
        </Button>
        <Button 
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => quickSyncMutation.mutate()}
          disabled={quickSyncMutation.isPending}
        >
          <Zap className="w-4 h-4 mr-2" />
          {quickSyncMutation.isPending ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>
    </div>
  );
}