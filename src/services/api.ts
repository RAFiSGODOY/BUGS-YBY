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
    const response = await this.makeRequest<{ id: string }>(
      API_CONFIG.BASE_URL,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (response.success && response.data) {
      BIN_ID = response.data.id;
      // Salvar o ID no localStorage para uso futuro
      localStorage.setItem(API_CONFIG.BIN_ID_KEY, BIN_ID);
    }

    return response;
  }

  // Atualizar dados existentes
  async updateBin(data: any): Promise<ApiResponse<any>> {
    if (!BIN_ID) {
      // Tentar recuperar do localStorage
      BIN_ID = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    }

    if (!BIN_ID) {
      // Se não existe, criar um novo
      return this.createBin(data);
    }

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
    if (!BIN_ID) {
      // Tentar recuperar do localStorage
      BIN_ID = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    }

    if (!BIN_ID) {
      return { success: false, error: 'Bin ID não encontrado' };
    }

    return this.makeRequest(`${API_CONFIG.BASE_URL}/${BIN_ID}/latest`);
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
