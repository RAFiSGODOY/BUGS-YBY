export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  email?: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface AppVersion {
  version: string;
  createdAt: Date;
  createdBy: string;
}

// Usuários pré-definidos
export const PREDEFINED_USERS: User[] = [
  { id: 'admin', name: 'Administrador', role: 'admin', email: 'admin@yby.com' },
  { id: 'rafael', name: 'Rafael', role: 'user', email: 'rafael@yby.com' },
  { id: 'maria', name: 'Maria Silva', role: 'user', email: 'maria@yby.com' },
  { id: 'joao', name: 'João Santos', role: 'user', email: 'joao@yby.com' },
  { id: 'ana', name: 'Ana Costa', role: 'user', email: 'ana@yby.com' },
  { id: 'pedro', name: 'Pedro Oliveira', role: 'user', email: 'pedro@yby.com' },
  { id: 'carla', name: 'Carla Ferreira', role: 'user', email: 'carla@yby.com' },
  { id: 'lucas', name: 'Lucas Almeida', role: 'user', email: 'lucas@yby.com' },
  { id: 'julia', name: 'Julia Rodrigues', role: 'user', email: 'julia@yby.com' },
  { id: 'bruno', name: 'Bruno Lima', role: 'user', email: 'bruno@yby.com' },
  { id: 'fernanda', name: 'Fernanda Souza', role: 'user', email: 'fernanda@yby.com' }
];

// Versões disponíveis (apenas admin pode alterar)
export const DEFAULT_VERSION = '1.0.0';