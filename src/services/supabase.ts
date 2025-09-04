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

      // Verificar se há conteúdo na resposta
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      if (!responseText.trim()) {
        console.log('⚠️ Empty response from Supabase');
        return { success: true, data: [] };
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Response data:', data);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Raw response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Supabase Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Testar conexão básica
  async testConnection(): Promise<SupabaseResponse<any>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/`;
    
    const response = await this.makeRequest<any>(endpoint, {
      method: 'GET',
    });

    return response;
  }

  // Buscar todos os bugs
  async getBugs(): Promise<SupabaseResponse<Bug[]>> {
    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?select=*&order=created_at.desc`;
    
    const response = await this.makeRequest<Bug[]>(endpoint, {
      method: 'GET',
    });

    if (response.success && response.data) {
      // Se não há dados, retornar array vazio
      if (!Array.isArray(response.data)) {
        return { success: true, data: [] };
      }

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
    
    // Gerar ID numérico baseado no UUID para compatibilidade com bigint
    const numericId = Math.abs(bug.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    const bugData = {
      id: numericId,
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
      original_id: bug.id, // Salvar o UUID original
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
    // Gerar ID numérico baseado no UUID para compatibilidade com bigint
    const numericId = Math.abs(bug.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${numericId}`;
    
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
      original_id: bug.id, // Salvar o UUID original
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
    // Gerar ID numérico baseado no UUID para compatibilidade com bigint
    const numericId = Math.abs(bugId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    const endpoint = `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${numericId}`;
    
    const response = await this.makeRequest<void>(endpoint, {
      method: 'DELETE',
    });

    return response;
  }

  // Sincronizar todos os bugs (bug por bug)
  async syncBugs(bugs: Bug[]): Promise<SupabaseResponse<Bug[]>> {
    console.log('🔄 Sincronizando bugs:', { count: bugs.length });

    const results: Bug[] = [];
    let hasErrors = false;

    // Sincronizar cada bug individualmente
    for (const bug of bugs) {
      try {
        // Gerar ID numérico para busca
        const numericId = Math.abs(bug.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));

        // Primeiro, tentar buscar o bug existente
        const existingResponse = await this.makeRequest<Bug[]>(
          `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${numericId}`,
          { method: 'GET' }
        );

        const bugData = {
          id: numericId,
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
          original_id: bug.id, // Salvar o UUID original
        };

        let response;
        if (existingResponse.success && existingResponse.data && existingResponse.data.length > 0) {
          // Bug existe, atualizar
          console.log('📝 Atualizando bug existente:', bug.id);
          response = await this.makeRequest<Bug[]>(
            `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}?id=eq.${numericId}`,
            {
              method: 'PATCH',
              body: JSON.stringify(bugData),
            }
          );
        } else {
          // Bug não existe, criar
          console.log('➕ Criando novo bug:', bug.id);
          response = await this.makeRequest<Bug>(
            `${SUPABASE_CONFIG.URL}/rest/v1/${SUPABASE_CONFIG.TABLE_NAME}`,
            {
              method: 'POST',
              body: JSON.stringify(bugData),
            }
          );
        }

        if (response.success) {
          const syncedBug = Array.isArray(response.data) ? response.data[0] : response.data;
          if (syncedBug) {
            results.push({
              id: syncedBug.id,
              title: syncedBug.title,
              description: syncedBug.description,
              category: syncedBug.category,
              priority: syncedBug.priority,
              isFixed: syncedBug.is_fixed,
              createdAt: new Date(syncedBug.created_at),
              fixedAt: syncedBug.fixed_at ? new Date(syncedBug.fixed_at) : undefined,
              screenshot: syncedBug.screenshot,
              platform: syncedBug.platform,
              deviceInfo: syncedBug.device_info,
            });
          }
        } else {
          console.error('❌ Erro ao sincronizar bug:', bug.id, response.error);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Erro ao processar bug:', bug.id, error);
        hasErrors = true;
      }
    }

    console.log('✅ Sincronização concluída:', { 
      total: bugs.length, 
      success: results.length, 
      errors: hasErrors 
    });

    return {
      success: !hasErrors,
      data: results,
      error: hasErrors ? 'Alguns bugs falharam na sincronização' : undefined
    };
  }
}

export const supabaseService = new SupabaseService();
