import { useState } from 'react';
import { Check, X, Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabaseService } from '../services/supabase';
import { SUPABASE_CONFIG } from '../config/supabase';

interface SupabaseTestProps {
  onForceSync: () => void;
}

export function SupabaseTest({ onForceSync }: SupabaseTestProps) {
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
      console.log('🧪 Testando conexão com Supabase...');
      
      // Testar configuração
      if (SUPABASE_CONFIG.URL === 'https://your-project.supabase.co') {
        throw new Error('URL do Supabase não configurada');
      }
      
      if (SUPABASE_CONFIG.ANON_KEY === 'your-anon-key-here') {
        throw new Error('Chave anônima do Supabase não configurada');
      }

      // Testar conexão fazendo uma requisição simples
      const response = await supabaseService.getBugs();
      
      if (response.success) {
        setTestResult({
          success: true,
          message: 'Conexão estabelecida com sucesso!',
          details: {
            url: SUPABASE_CONFIG.URL,
            tableName: SUPABASE_CONFIG.TABLE_NAME,
            bugsCount: response.data?.length || 0,
            syncInterval: `${SUPABASE_CONFIG.SYNC_INTERVAL / 1000}s`
          }
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro na conexão: ${response.error}`,
          details: {
            url: SUPABASE_CONFIG.URL,
            tableName: SUPABASE_CONFIG.TABLE_NAME
          }
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: {
          url: SUPABASE_CONFIG.URL,
          tableName: SUPABASE_CONFIG.TABLE_NAME
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = SUPABASE_CONFIG.URL !== 'https://your-project.supabase.co' && 
                      SUPABASE_CONFIG.ANON_KEY !== 'your-anon-key-here';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Teste de Conexão - Supabase
        </h3>
      </div>

      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Supabase não configurado</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Configure a URL e chave anônima em src/config/supabase.ts
          </p>
        </div>
      )}

      {isConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-green-800">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Supabase configurado</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            URL: {SUPABASE_CONFIG.URL}
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button
          onClick={testConnection}
          disabled={isTesting || !isConfigured}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {isTesting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Testar Conexão
            </>
          )}
        </button>

        {isConfigured && (
          <button
            onClick={onForceSync}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Forçar Sync
          </button>
        )}
      </div>

      {testResult && (
        <div className={`border rounded-lg p-3 ${
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
            <div className="text-xs text-gray-600 mt-2">
              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        <p><strong>URL:</strong> {SUPABASE_CONFIG.URL}</p>
        <p><strong>Tabela:</strong> {SUPABASE_CONFIG.TABLE_NAME}</p>
        <p><strong>Intervalo de sync:</strong> {SUPABASE_CONFIG.SYNC_INTERVAL / 1000}s</p>
      </div>
    </div>
  );
}
