import React from 'react';
import { PTNIModeController } from '@/components/PTNIModeController';

export default function PTNIModeControllerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            PTNI Trading Mode Controller
          </h1>
          <p className="text-xl text-gray-300">
            Seamlessly toggle between real money trading and simulation mode
          </p>
        </div>
        
        <PTNIModeController />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-black/20 rounded-lg border border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">Real Money Mode</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Executes actual trades with real account funds</li>
              <li>• Updates authentic account balances</li>
              <li>• Generates real trade confirmations</li>
              <li>• Leverages authenticated Robinhood sessions</li>
              <li>• Full PTNI analytics integration</li>
            </ul>
          </div>
          
          <div className="p-6 bg-black/20 rounded-lg border border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">Simulation Mode</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Safe testing environment with virtual funds</li>
              <li>• Real-time market data and pricing</li>
              <li>• Comprehensive trade execution simulation</li>
              <li>• Full PTNI diagnostic capabilities</li>
              <li>• Risk-free strategy development</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}