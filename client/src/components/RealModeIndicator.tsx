import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Zap, DollarSign, Activity, Shield, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface RealModeStatus {
  realModeEnabled: boolean;
  isLoggedIn: boolean;
  accountBalance: number;
  isActive: boolean;
  totalTrades: number;
  successfulTrades: number;
  successRate: number;
}

export default function RealModeIndicator() {
  // Widget disabled - returning null to remove from UI
  return null;
}