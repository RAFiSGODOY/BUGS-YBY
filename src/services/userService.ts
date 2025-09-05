import { supabaseService } from './supabase';
import { User } from '../types/User';

export interface UserServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class UserService {
  // Buscar todos os usuários
  async getUsers(): Promise<UserServiceResponse<User[]>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const { data, error } = await supabaseService.client
        .from('users')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return { success: false, error: error.message };
      }

      const users = data?.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: new Date(user.created_at),
        lastLogin: user.last_login ? new Date(user.last_login) : undefined
      })) || [];

      return { success: true, data: users };
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Criar usuário
  async createUser(userData: Omit<User, 'createdAt' | 'lastLogin'>): Promise<UserServiceResponse<User>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const { data, error } = await supabaseService.client
        .from('users')
        .insert({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          is_active: userData.isActive ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return { success: false, error: error.message };
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        lastLogin: data.last_login ? new Date(data.last_login) : undefined
      };

      return { success: true, data: user };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Atualizar usuário
  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<UserServiceResponse<User>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.lastLogin !== undefined) updateData.last_login = updates.lastLogin?.toISOString();

      const { data, error } = await supabaseService.client
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return { success: false, error: error.message };
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        lastLogin: data.last_login ? new Date(data.last_login) : undefined
      };

      return { success: true, data: user };
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Desativar usuário (soft delete)
  async deactivateUser(id: string): Promise<UserServiceResponse<void>> {
    return this.updateUser(id, { isActive: false });
  }

  // Ativar usuário
  async activateUser(id: string): Promise<UserServiceResponse<void>> {
    return this.updateUser(id, { isActive: true });
  }

  // Deletar usuário permanentemente (apenas admin)
  async deleteUser(id: string): Promise<UserServiceResponse<void>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const { error } = await supabaseService.client
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Atualizar último login
  async updateLastLogin(id: string): Promise<UserServiceResponse<void>> {
    return this.updateUser(id, { lastLogin: new Date() });
  }

  // Sincronizar usuários pré-definidos com o banco
  async syncPredefinedUsers(users: User[]): Promise<UserServiceResponse<void>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      console.log('🔄 Sincronizando usuários pré-definidos...');

      for (const user of users) {
        // Verificar se usuário já existe
        const { data: existingUser } = await supabaseService.client
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          // Criar usuário se não existir
          await this.createUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: true
          });
          console.log(`✅ Usuário criado: ${user.name}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao sincronizar usuários:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const userService = new UserService();