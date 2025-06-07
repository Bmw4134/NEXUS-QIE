import React from 'react';
import { Link, useLocation } from 'wouter';

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/live-trading', label: 'Live Trading', icon: '💰' },
    { path: '/quantum-trading-dashboard', label: 'Quantum Trading', icon: '⚛️' },
    { path: '/automation', label: 'Automation', icon: '🤖' },
    { path: '/browser', label: 'Browser', icon: '🌐' },
    { path: '/quantum-ai', label: 'Quantum AI', icon: '🧠' },
    { path: '/kaizen-agent', label: 'Kaizen Agent', icon: '🎯' },
    { path: '/watson-command', label: 'Watson Command', icon: '⚡' },
    { path: '/infinity-sovereign', label: 'Infinity Sovereign', icon: '👑' },
    { path: '/infinity-uniform', label: 'Infinity Uniform', icon: '🔧' },
    { path: '/user-management', label: 'User Management', icon: '👥' },
    { path: '/github-brain', label: 'GitHub Brain', icon: '🧠' },
    { path: '/bim-infinity', label: 'BIM Infinity', icon: '🏗️' },
    { path: '/proof-pudding', label: 'Proof Pudding', icon: '🍮' },
    { path: '/particle-playground', label: 'Particle Playground', icon: '⚛️' },
    { path: '/trading-bot', label: 'Trading Bot', icon: '🤖' },
    { path: '/simple-trading', label: 'Simple Trading', icon: '📈' }
  ];

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#001122',
      border: '1px solid #003366',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #003366',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#00ffff',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0,
          fontFamily: 'monospace'
        }}>
          NEXUS PLATFORM
        </h2>
        <div style={{
          color: '#aaaaaa',
          fontSize: '12px',
          marginTop: '5px'
        }}>
          Financial AI • $834.97 Balance
        </div>
      </div>

      {/* Navigation Items */}
      <div style={{ padding: '10px 0' }}>
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                margin: '2px 10px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#003366' : 'transparent',
                border: isActive ? '1px solid #0066aa' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#002244';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              >
                <span style={{
                  fontSize: '16px',
                  marginRight: '12px'
                }}>
                  {item.icon}
                </span>
                <span style={{
                  color: isActive ? '#00ffff' : '#cccccc',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '15px 20px',
        borderTop: '1px solid #003366',
        backgroundColor: '#000011'
      }}>
        <div style={{
          color: '#666666',
          fontSize: '11px',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Nexus Quantum Trading Platform
          <br />
          Real-time market data active
        </div>
      </div>
    </div>
  );
}