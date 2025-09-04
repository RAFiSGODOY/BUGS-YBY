// Configuração do Supabase
// Para usar esta funcionalidade, você precisa:
// 1. Criar uma conta gratuita em https://supabase.com/
// 2. Criar um novo projeto
// 3. Obter sua URL e chave anônima
// 4. Substituir os valores abaixo

export const SUPABASE_CONFIG = {
  // URL do seu projeto Supabase
  URL: 'https://ingcrcgnvtjmggyjlbdq.supabase.co',
  
  // Chave anônima (pública) do Supabase
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ2NyY2dudnRqbWdneWpsYmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTc4NTEsImV4cCI6MjA3MjU3Mzg1MX0.r1vDN-WxiYgenQNXn5qXS7V8QDtmppEWyertG_oWecI',
  
  // Nome da tabela para armazenar bugs
  TABLE_NAME: 'bugs',
  
  // Intervalo de sincronização automática (em milissegundos)
  SYNC_INTERVAL: 30000, // 30 segundos
};

// Instruções para configurar:
export const SUPABASE_SETUP_INSTRUCTIONS = `
🔧 CONFIGURAÇÃO DO SUPABASE:

1. Acesse https://supabase.com/ e crie uma conta gratuita
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: "bugs-yby")
4. Defina uma senha para o banco de dados
5. Aguarde o projeto ser criado (2-3 minutos)
6. Vá em "Settings" > "API"
7. Copie a "Project URL" e "anon public" key
8. Substitua os valores em src/config/supabase.ts
9. Vá em "Table Editor" e crie uma nova tabela:
   - Nome: "bugs"
   - Colunas:
     * id (text, primary key)
     * title (text)
     * description (text)
     * category (text)
     * priority (text)
     * status (text)
     * created_at (timestamp)
     * fixed_at (timestamp)
     * screenshot (text)
     * platform (text)
     * device_info (text)
     * user_id (text)

✅ Após configurar, os dados serão sincronizados automaticamente!

📱 Funcionalidades:
- Sincronização automática a cada 30 segundos
- Funciona offline (dados salvos localmente)
- Sincronização manual com botão
- Status de conexão em tempo real
- Mesclagem inteligente de dados
- Código de convite fixo: 123456

🎯 IMPORTANTE: Todos os usuários usam o mesmo código automaticamente!
`;
