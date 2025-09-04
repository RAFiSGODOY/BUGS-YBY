import { SUPABASE_CONFIG } from '../config/supabase';
import { Bug } from '../types/Bug';

export interface SupabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SupabaseService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SupabaseResponse<T>> {
    // Verificar se a configuração está completa
    if (SUPABASE_CONFIG.URL === 'https://your-project.supabase.co' || 
        SUPABASE_CONFIG.ANON_KEY === 'your-anon-key-here') {
      console.warn('⚠️ Supabase não configurado. Sincronização online desabilitada.');
      return {
        success: false,
        error: 'Supabase não configurado. Configure em src/config/supabase.ts'
      };
    }

    try {
      console.log('🔗 Fazendo requisição para:', endpoint);
      console.log('📋 Headers:', {
        'Content-Type': 'application/json',
        'apikey': '***configurada***',
        'Authorization': 'Bearer ***configurada***',
      });

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
          ...options.headers,
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Supabase Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Buscar todos os bugs
  async getBugs(): Promise<SupabaseResponse<Bug[]>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?select=*&order=created_at.desc`;
    
    const response = await this.makeRequest<Bug[]>(endpoint, {
      method: 'GET',
    });

    if (response.success && response.data) {
      // Converter timestamps para Date objects e mapear campos
      const bugs = response.data.map((bug: any) => ({
        id: bug.id,
        title: bug.title,
        description: bug.description,
        category: bug.category,
        priority: bug.priority,
        isFixed: bug.is_fixed,
        createdAt: new Date(bug.created_at),
        fixedAt: bug.fixed_at ? new Date(bug.fixed_at) : undefined,
        screenshot: bug.screenshot,
        platform: bug.platform,
        deviceInfo: bug.device_info,
      }));
      
      return { success: true, data: bugs };
    }

    return response;
  }

  // Adicionar um novo bug
  async addBug(bug: Bug): Promise<SupabaseResponse<Bug>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}`;
    
    const bugData = {
      id: bug.id,
      title: bug.title,
      description: bug.description,
      category: bug.category,
      priority: bug.priority,
      is_fixed: bug.isFixed,
      created_at: bug.createdAt.toISOString(),
      fixed_at: bug.fixedAt?.toISOString() || null,
      screenshot: bug.screenshot || null,
      platform: bug.platform || null,
      device_info: bug.deviceInfo || null,
      user_id: 'shared', // Todos usam o mesmo ID para compartilhar
    };

    const response = await this.makeRequest<Bug>(endpoint, {
      method: 'POST',
      body: JSON.stringify(bugData),
    });

    if (response.success && response.data) {
      // Converter de volta para o formato Bug
      const createdBug = {
        id: response.data.id,
        title: response.data.title,
        description: response.data.description,
        category: response.data.category,
        priority: response.data.priority,
        isFixed: response.data.is_fixed,
        createdAt: new Date(response.data.created_at),
        fixedAt: response.data.fixed_at ? new Date(response.data.fixed_at) : undefined,
        screenshot: response.data.screenshot,
        platform: response.data.platform,
        deviceInfo: response.data.device_info,
      };
      
      return { success: true, data: createdBug };
    }

    return response;
  }

  // Atualizar um bug existente
  async updateBug(bug: Bug): Promise<SupabaseResponse<Bug>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${bug.id}`;
    
    const bugData = {
      title: bug.title,
      description: bug.description,
      category: bug.category,
      priority: bug.priority,
      is_fixed: bug.isFixed,
      fixed_at: bug.fixedAt?.toISOString() || null,
      screenshot: bug.screenshot || null,
      platform: bug.platform || null,
      device_info: bug.deviceInfo || null,
    };

    const response = await this.makeRequest<Bug[]>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(bugData),
    });

    if (response.success && response.data && response.data.length > 0) {
      const updatedBug = {
        id: response.data[0].id,
        title: response.data[0].title,
        description: response.data[0].description,
        category: response.data[0].category,
        priority: response.data[0].priority,
        isFixed: response.data[0].is_fixed,
        createdAt: new Date(response.data[0].created_at),
        fixedAt: response.data[0].fixed_at ? new Date(response.data[0].fixed_at) : undefined,
        screenshot: response.data[0].screenshot,
        platform: response.data[0].platform,
        deviceInfo: response.data[0].device_info,
      };
      
      return { success: true, data: updatedBug };
    }

    return response;
  }

  // Deletar um bug
  async deleteBug(bugId: string): Promise<SupabaseResponse<void>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${bugId}`;
    
    const response = await this.makeRequest<void>(endpoint, {
      method: 'DELETE',
    });

    return response;
  }

  // Sincronizar todos os bugs (upsert)
  async syncBugs(bugs: Bug[]): Promise<SupabaseResponse<Bug[]>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}`;
    
    const bugsData = bugs.map(bug => ({
      id: bug.id,
      title: bug.title,
      description: bug.description,
      category: bug.category,
      priority: bug.priority,
      is_fixed: bug.isFixed,
      created_at: bug.createdAt.toISOString(),
      fixed_at: bug.fixedAt?.toISOString() || null,
      screenshot: bug.screenshot || null,
      platform: bug.platform || null,
      device_info: bug.deviceInfo || null,
      user_id: 'shared',
    }));

    // Usar upsert para sincronizar todos os bugs
    const response = await this.makeRequest<Bug[]>(endpoint, {
      method: 'POST',
      body: JSON.stringify(bugsData),
      headers: {
        'Prefer': 'resolution=merge-duplicates',
      },
    });

    if (response.success && response.data) {
      const syncedBugs = response.data.map((bug: any) => ({
        id: bug.id,
        title: bug.title,
        description: bug.description,
        category: bug.category,
        priority: bug.priority,
        isFixed: bug.is_fixed,
        createdAt: new Date(bug.created_at),
        fixedAt: bug.fixed_at ? new Date(bug.fixed_at) : undefined,
        screenshot: bug.screenshot,
        platform: bug.platform,
        deviceInfo: bug.device_info,
      }));
      
      return { success: true, data: syncedBugs };
    }

    return response;
  }
}

export const supabaseService = new SupabaseService();
