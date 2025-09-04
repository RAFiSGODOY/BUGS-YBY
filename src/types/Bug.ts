export interface Bug {
  id: string;
  title: string;
  description: string;
  category: BugCategory;
  isFixed: boolean;
  priority: Priority;
  createdAt: Date;
  fixedAt?: Date;
}

export type BugCategory = 'interface' | 'ux' | 'logica' | 'performance' | 'seguranca' | 'outros';

export type Priority = 'baixa' | 'media' | 'alta' | 'critica';

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