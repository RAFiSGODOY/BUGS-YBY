export interface Bug {
  id: string;
  title: string;
  description: string;
  category: BugCategory;
  isFixed: boolean;
  priority: Priority;
  createdAt: Date;
  fixedAt?: Date;
  screenshot?: string; // Base64 da imagem
  platform?: Platform; // Android, iOS, Web, etc.
  deviceInfo?: string; // Informações adicionais do dispositivo
}

export type BugCategory = 'interface' | 'ux' | 'logica' | 'performance' | 'seguranca' | 'outros';

export type Priority = 'baixa' | 'media' | 'alta' | 'critica';

export type Platform = 'android' | 'ios' | 'web' | 'desktop' | 'unknown';

export const BUG_CATEGORIES: Record<BugCategory, string> = {
  interface: 'Interface',
  ux: 'UX',
  logica: 'Lógica',
  performance: 'Performance',
  seguranca: 'Segurança',
  outros: 'Outros'
};

export const PRIORITIES: Record<Priority, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
  media: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  critica: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
};

export const PLATFORMS: Record<Platform, { label: string; icon: string; color: string }> = {
  android: { label: 'Android', icon: '🤖', color: 'bg-green-100 text-green-800' },
  ios: { label: 'iOS', icon: '🍎', color: 'bg-gray-100 text-gray-800' },
  web: { label: 'Web', icon: '🌐', color: 'bg-blue-100 text-blue-800' },
  desktop: { label: 'Desktop', icon: '💻', color: 'bg-purple-100 text-purple-800' },
  unknown: { label: 'Desconhecido', icon: '❓', color: 'bg-gray-100 text-gray-600' }
};