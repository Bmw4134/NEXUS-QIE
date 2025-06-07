import { useEffect } from 'react';

export default function Dashboard() {
  // Redirect to live trading page immediately
  useEffect(() => {
    window.location.href = '/live-trading';
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000011',
      color: '#00ffff',
      fontFamily: 'monospace',
      fontSize: '18px'
    }}>
      Redirecting to NEXUS Live Trading Platform...
    </div>
  );
}