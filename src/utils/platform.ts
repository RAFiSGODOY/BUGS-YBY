import { Platform } from '../types/Bug';

export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar Android
  if (userAgent.includes('android')) {
    return 'android';
  }
  
  // Detectar iOS
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return 'ios';
  }
  
  // Detectar se é mobile (mas não Android/iOS específico)
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'android'; // Assumir Android para outros mobiles
  }
  
  // Detectar desktop
  if (userAgent.includes('windows') || userAgent.includes('macintosh') || userAgent.includes('linux')) {
    return 'desktop';
  }
  
  // Se não conseguir detectar, assumir web
  return 'web';
}

export function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  const platform = detectPlatform();
  
  // Informações básicas do dispositivo
  const info = {
    platform,
    userAgent: userAgent.substring(0, 100), // Limitar tamanho
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(info);
}

export function isMobile(): boolean {
  const platform = detectPlatform();
  return platform === 'android' || platform === 'ios';
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
