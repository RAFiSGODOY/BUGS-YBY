// Configuração da API JSONBin.io
// Para usar esta funcionalidade, você precisa:
// 1. Criar uma conta gratuita em https://jsonbin.io/
// 2. Obter sua API Key
// 3. Substituir 'YOUR_API_KEY_HERE' pela sua chave real

export const API_CONFIG = {
  // Sua API Key do JSONBin.io
  API_KEY: '$2a$10$jFKEiBBB8NgK8wMW2TzeY.G7vYm8BBbzru20XLJi13xRaPJfxXuja',
  
  // URL base da API
  BASE_URL: 'https://api.jsonbin.io/v3/b',
  
  // Intervalo de sincronização automática (em milissegundos)
  SYNC_INTERVAL: 30000, // 30 segundos
  
  // Chave para armazenar o ID do bin no localStorage
  BIN_ID_KEY: 'yby-bin-id',
  
  // Chave para armazenar bugs no localStorage
  BUGS_STORAGE_KEY: 'yby-bugs'
};

// Instruções para configurar:
export const SETUP_INSTRUCTIONS = `
🔧 CONFIGURAÇÃO DA SINCRONIZAÇÃO ONLINE:

1. Acesse https://jsonbin.io/ e crie uma conta gratuita
2. Vá em "API Keys" e crie uma nova chave
3. Copie sua API Key
4. Substitua 'YOUR_API_KEY_HERE' no arquivo src/config/api.ts pela sua chave real
5. Salve o arquivo e recarregue a aplicação

✅ Após configurar, os dados serão sincronizados automaticamente entre todos os dispositivos!

📱 Funcionalidades:
- Sincronização automática a cada 30 segundos
- Funciona offline (dados salvos localmente)
- Sincronização manual com botão
- Status de conexão em tempo real
- Mesclagem inteligente de dados
`;
