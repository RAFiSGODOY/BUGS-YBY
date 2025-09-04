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
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_CONFIG.API_KEY,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
    const response = await this.makeRequest<any>(
      API_CONFIG.BASE_URL,
      {
        method: 'POST',
        body: JSON.stringify(data),
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
    // Verificar se já temos um Bin ID real
    let binId = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    
    if (!binId || binId === API_CONFIG.SHARED_BIN_ID) {
      // Se não temos um Bin ID real, criar um novo
      const createResponse = await this.createBin(data);
      if (createResponse.success) {
        BIN_ID = createResponse.data.id;
        localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
        console.log('✅ Bin ID criado automaticamente:', BIN_ID);
        return createResponse;
      }
      return createResponse;
    }

    BIN_ID = binId;
    return this.makeRequest(
      `${API_CONFIG.BASE_URL}/${BIN_ID}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Buscar dados
  async getBin(): Promise<ApiResponse<any>> {
    // Verificar se já temos um Bin ID real
    let binId = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    
    if (!binId || binId === API_CONFIG.SHARED_BIN_ID) {
      // Se não temos um Bin ID real, retornar erro para criar um novo
      return { success: false, error: 'Bin ID não encontrado. Criando novo...' };
    }

    BIN_ID = binId;
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
