
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, DollarSign, BarChart3, Target, Shield, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TradingStatusData {
  simulationMode: boolean;
  tradingEngineStatus: 'online' | 'offline';
  accountBalance: number;
  totalTrades: number;
  successRate: number;
  marketFocus: string;
  nexusQuantumActive: boolean;
}

interface TradingStatusWidgetProps {
  data?: TradingStatusData;
  className?: string;
  compact?: boolean;
}

export default function TradingStatusWidget({ 
  data = {
    simulationMode: true,
    tradingEngineStatus: 'offline',
    accountBalance: 756.95,
    totalTrades: 0,
    successRate: 0.0,
    marketFocus: 'Crypto Assets',
    nexusQuantumActive: true
  },
  className,
  compact = false
}: TradingStatusWidgetProps) {
  const [isOpen, setIsOpen] = useState(!compact);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const StatusIndicator = ({ status, label }: { status: string; label: string }) => (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Card className={cn("bg-gradient-to-br from-green-600 to-green-700 text-white border-green-500", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Trading Status</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Simulation Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Simulation Mode</span>
              </div>
              <Badge variant={data.simulationMode ? "secondary" : "destructive"}>
                {data.simulationMode ? "Active" : "Offline"}
              </Badge>
            </div>

            {/* Trading Engine Status */}
            <div className="flex items-center justify-between">
              <StatusIndicator status={data.tradingEngineStatus} label="Trading Engine" />
              <Activity className="w-4 h-4" />
            </div>

            {/* Account Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Account Balance</span>
              </div>
              <span className="font-bold text-lg">${data.accountBalance.toFixed(2)}</span>
            </div>

            {/* Trading Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-green-200">Total Trades</div>
                <div className="text-lg font-bold">{data.totalTrades}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-green-200">Success Rate</div>
                <div className="text-lg font-bold">{data.successRate}%</div>
              </div>
            </div>

            {/* Market Focus */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-sm">Market Focus:</span>
              </div>
              <span className="text-sm font-medium">{data.marketFocus}</span>
            </div>

            {/* NEXUS Quantum Status */}
            {data.nexusQuantumActive && (
              <div className="flex items-center justify-center">
                <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  NEXUS QUANTUM ACTIVE
                </Badge>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
