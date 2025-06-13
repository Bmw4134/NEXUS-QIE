import { useState, useEffect } from 'react';

export interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isFullscreen: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function useResponsive(): ResponsiveConfig {
  const [config, setConfig] = useState<ResponsiveConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isFullscreen: false,
    orientation: 'landscape',
    screenSize: 'lg'
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isFullscreen = window.innerHeight === window.screen.height;

      const newConfig: ResponsiveConfig = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isFullscreen,
        orientation: width > height ? 'landscape' : 'portrait',
        screenSize: width < 640 ? 'xs' :
                   width < 768 ? 'sm' :
                   width < 1024 ? 'md' :
                   width < 1280 ? 'lg' :
                   width < 1536 ? 'xl' : '2xl'
      };

      setConfig(newConfig);
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    window.addEventListener('orientationchange', updateConfig);

    return () => {
      window.removeEventListener('resize', updateConfig);
      window.removeEventListener('orientationchange', updateConfig);
    };
  }, []);

  return config;
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = async (element?: HTMLElement) => {
    const target = element || document.documentElement;
    
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen: isFullscreen ? exitFullscreen : enterFullscreen
  };
}