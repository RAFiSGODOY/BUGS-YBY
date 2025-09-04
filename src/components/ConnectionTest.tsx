import { useState } from 'react';
import { Check, X, Wifi, AlertCircle } from 'lucide-react';
import { SUPABASE_CONFIG } from '../config/supabase';

export function ConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando conexão básica com Supabase...');
      
      // Teste 1: Verificar configuração
      if (SUPABASE_CONFIG.URL === 'https://your-project.supabase.co') {
        throw new Error('URL do Supabase não configurada');
      }
      
      if (SUPABASE_CONFIG.ANON_KEY === 'your-anon-key-here') {
        throw new Error('Chave anônima do Supabase não configurada');
      }

      // Teste 2: Fazer requisição simples para a API
      const response = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Teste 3: Verificar se consegue acessar a tabela bugs
      const tableResponse = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/bugs?select=count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
        },
      });

      console.log('📊 Table response status:', tableResponse.status);

      if (tableResponse.status === 404) {
        setTestResult({
          success: false,
          message: 'Conexão OK, mas tabela "bugs" não encontrada',
          details: {
            url: SUPABASE_CONFIG.URL,
            tableExists: false,
            connectionStatus: 'OK',
            tableStatus: 'NOT_FOUND'
          }
        });
      } else if (tableResponse.ok) {
        setTestResult({
          success: true,
          message: 'Conexão estabelecida com sucesso!',
          details: {
            url: SUPABASE_CONFIG.URL,
            tableExists: true,
            connectionStatus: 'OK',
            tableStatus: 'OK'
          }
        });
      } else {
        const errorText = await tableResponse.text();
        throw new Error(`Erro na tabela: ${tableResponse.status} - ${errorText}`);
      }

    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: {
          url: SUPABASE_CONFIG.URL,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          Teste de Conectividade
        </h3>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          URL: <code className="bg-gray-100 px-1 rounded text-xs">{SUPABASE_CONFIG.URL}</code>
        </p>
        <p className="text-sm text-gray-600">
          Chave: <code className="bg-gray-100 px-1 rounded text-xs">
            {SUPABASE_CONFIG.ANON_KEY.substring(0, 20)}...
          </code>
        </p>
      </div>

      <button
        onClick={testConnection}
        disabled={isTesting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isTesting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Testando...
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            Testar Conexão
          </>
        )}
      </button>

      {testResult && (
        <div className={`mt-4 border rounded-lg p-3 ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </span>
          </div>
          
          {testResult.details && (
            <div className="text-xs text-gray-600">
              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-800">
        <p><strong>💡 Dica:</strong> Este teste verifica se a URL e chave estão corretas e se a tabela existe.</p>
      </div>
    </div>
  );
}
