import { API_CONFIG } from '../config/api';

// ID do bin (será criado automaticamente na primeira vez)
let BIN_ID: string | null = null;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Verificar se a API Key está configurada
    if (API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('⚠️ API Key não configurada. Sincronização online desabilitada.');
      return {
        success: false,
        error: 'API Key não configurada. Configure em src/config/api.ts'
      };
    }

    try {
      console.log('🔗 Fazendo requisição para:', endpoint);
      console.log('📋 Headers:', {
        'Content-Type': 'application/json',
        'X-Master-Key': API_CONFIG.API_KEY ? '***configurada***' : 'NÃO CONFIGURADA',
        'X-Bin-Name': 'Bugs YBY',
      });
      console.log('📦 Body:', options.body);

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_CONFIG.API_KEY,
          'X-Bin-Name': 'Bugs YBY',
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
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Criar um novo bin (primeira vez)
  async createBin(data: any): Promise<ApiResponse<{ id: string }>> {
    // Garantir que os dados são válidos
    const validData = Array.isArray(data) ? data : [];
    
    const response = await this.makeRequest<any>(
      'https://api.jsonbin.io/v3/b',
      {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.success && response.data) {
      // JSONBin.io retorna { record: {...}, metadata: { id: "..." } }
      const binId = response.data.metadata?.id || response.data.id;
      if (binId) {
        BIN_ID = binId;
        // Salvar o ID no localStorage para uso futuro
        localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
        console.log('✅ Bin criado com ID:', BIN_ID);
        
        // IMPORTANTE: Compartilhar o Bin ID para outros usuários
        // Você pode copiar este ID e compartilhar com seus amigos
        console.log('🔗 Compartilhe este Bin ID com seus amigos:', BIN_ID);
        console.log('📋 Cole este ID no campo "Bin ID Compartilhado" abaixo');
      }
    }

    return {
      success: response.success,
      data: response.data?.metadata ? { id: response.data.metadata.id } : response.data,
      error: response.error
    };
  }

  // Atualizar dados existentes
  async updateBin(data: any): Promise<ApiResponse<any>> {
    // Usar sempre o Bin ID fixo baseado no código de convite
    const fixedBinId = this.getFixedBinId();
    
    if (!fixedBinId) {
      // Se não temos um Bin ID fixo, criar um novo
      const createResponse = await this.createBin(data);
      if (createResponse.success) {
        BIN_ID = createResponse.data.id;
        localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
        console.log('✅ Bin ID fixo criado automaticamente:', BIN_ID);
        return createResponse;
      }
      return createResponse;
    }

    BIN_ID = fixedBinId;
    localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
    
    // Garantir que os dados são válidos
    const validData = Array.isArray(data) ? data : [];
    
    return this.makeRequest(
      `${API_CONFIG.BASE_URL}/${BIN_ID}`,
      {
        method: 'PUT',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }

  // Buscar dados
  async getBin(): Promise<ApiResponse<any>> {
    // Usar sempre o Bin ID fixo baseado no código de convite
    const fixedBinId = this.getFixedBinId();
    
    if (!fixedBinId) {
      // Se não temos um Bin ID fixo, retornar erro para criar um novo
      return { success: false, error: 'Bin ID fixo não encontrado. Criando novo...' };
    }

    BIN_ID = fixedBinId;
    localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
    const response = await this.makeRequest(`${API_CONFIG.BASE_URL}/${BIN_ID}/latest`);
    
    if (response.success && response.data) {
      // JSONBin.io retorna { record: {...}, metadata: {...} }
      return {
        success: true,
        data: response.data.record || response.data,
        error: response.error
      };
    }

    return response;
  }

  // Obter Bin ID fixo baseado no código de convite
  private getFixedBinId(): string | null {
    // Verificar se já temos um Bin ID salvo para o código fixo
    const storedBinId = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    if (storedBinId && storedBinId !== API_CONFIG.SHARED_BIN_ID) {
      return storedBinId;
    }
    
    // Se não temos, retornar null para criar um novo
    return null;
  }

  // Definir ID do bin manualmente (para sincronização)
  setBinId(id: string) {
    BIN_ID = id;
    localStorage.setItem(API_CONFIG.BIN_ID_KEY, id);
  }

  // Obter ID atual do bin
  getBinId(): string | null {
    return BIN_ID || localStorage.getItem(API_CONFIG.BIN_ID_KEY);
  }
}

export const apiService = new ApiService();
