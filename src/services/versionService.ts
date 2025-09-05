import { supabaseService } from './supabase';
import { AppVersion } from '../types/User';

export interface VersionServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class VersionService {
  // Buscar versão atual
  async getCurrentVersion(): Promise<VersionServiceResponse<AppVersion>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const { data, error } = await supabaseService.client
        .from('app_versions')
        .select('*')
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erro ao buscar versão atual:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        // Criar versão padrão se não existir
        return this.createVersion('1.0.0', 'admin', 'Versão inicial', true);
      }

      const version: AppVersion = {
        version: data.version,
        createdAt: new Date(data.created_at),
        createdBy: data.created_by
      };

      return { success: true, data: version };
    } catch (error) {
      console.error('❌ Erro ao buscar versão atual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Criar nova versão
  async createVersion(
    version: string, 
    createdBy: string, 
    description?: string, 
    setCurrent: boolean = true
  ): Promise<VersionServiceResponse<AppVersion>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      // Se esta versão deve ser a atual, desmarcar outras
      if (setCurrent) {
        await supabaseService.client
          .from('app_versions')
          .update({ is_current: false })
          .eq('is_current', true);
      }

      const { data, error } = await supabaseService.client
        .from('app_versions')
        .insert({
          version,
          created_by: createdBy,
          description,
          is_current: setCurrent
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar versão:', error);
        return { success: false, error: error.message };
      }

      const newVersion: AppVersion = {
        version: data.version,
        createdAt: new Date(data.created_at),
        createdBy: data.created_by
      };

      return { success: true, data: newVersion };
    } catch (error) {
      console.error('❌ Erro ao criar versão:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Definir versão atual
  async setCurrentVersion(version: string, updatedBy: string): Promise<VersionServiceResponse<void>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      // Desmarcar versão atual
      await supabaseService.client
        .from('app_versions')
        .update({ is_current: false })
        .eq('is_current', true);

      // Verificar se a versão existe
      const { data: existingVersion } = await supabaseService.client
        .from('app_versions')
        .select('id')
        .eq('version', version)
        .single();

      if (existingVersion) {
        // Marcar versão existente como atual
        const { error } = await supabaseService.client
          .from('app_versions')
          .update({ is_current: true })
          .eq('version', version);

        if (error) {
          console.error('❌ Erro ao definir versão atual:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Criar nova versão e marcar como atual
        const createResponse = await this.createVersion(version, updatedBy, undefined, true);
        if (!createResponse.success) {
          return createResponse;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao definir versão atual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Buscar histórico de versões
  async getVersionHistory(): Promise<VersionServiceResponse<AppVersion[]>> {
    if (!supabaseService.client) {
      return {
        success: false,
        error: 'Supabase não configurado'
      };
    }

    try {
      const { data, error } = await supabaseService.client
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar histórico de versões:', error);
        return { success: false, error: error.message };
      }

      const versions = data?.map((version: any) => ({
        version: version.version,
        createdAt: new Date(version.created_at),
        createdBy: version.created_by
      })) || [];

      return { success: true, data: versions };
    } catch (error) {
      console.error('❌ Erro ao buscar histórico de versões:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const versionService = new VersionService();