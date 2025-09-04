import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Cloud } from 'lucide-react';
import { apiService } from '../services/api';
import { API_CONFIG } from '../config/api';

interface ApiTestProps {
  onForceSync?: () => void;
}

export function ApiTest({ onForceSync }: ApiTestProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testApi = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Teste 1: Verificar se a API Key está configurada
      if (API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        setTestResult({
          success: false,
          message: 'API Key não configurada',
          details: 'Configure sua API Key em src/config/api.ts'
        });
        return;
      }

      // Teste 2: Criar um bin de teste
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Teste de conectividade da API'
      };

      const response = await apiService.createBin(testData);
      
      if (response.success) {
        setTestResult({
          success: true,
          message: 'API funcionando perfeitamente!',
          details: {
            binId: response.data?.id,
            status: 'Conexão estabelecida com sucesso',
            fullResponse: response.data
          }
        });
      } else {
        setTestResult({
          success: false,
          message: 'Erro na API',
          details: response.error
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro de conexão',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = () => {
    if (!testResult) return 'text-gray-600';
    return testResult.success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isTesting) return <RefreshCw className="h-5 w-5 animate-spin" />;
    if (!testResult) return <AlertTriangle className="h-5 w-5" />;
    return testResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🔧 Teste da API</h3>
        <div className="flex gap-2">
          {onForceSync && (
            <button
              onClick={onForceSync}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Cloud className="h-4 w-4" />
              Forçar Sync
            </button>
          )}
          <button
            onClick={testApi}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Testar API
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status da API Key:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE' ? 'Não configurada' : 'Configurada'}
          </span>
        </div>

        {API_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE' && (
          <div className="text-xs text-gray-600">
            <strong>API Key:</strong> {API_CONFIG.API_KEY.substring(0, 20)}...
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>
                {testResult.message}
              </span>
            </div>
            
            {testResult.details && (
              <div className="text-sm text-gray-700">
                {typeof testResult.details === 'string' ? (
                  <p>{testResult.details}</p>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(testResult.details).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>URL da API:</strong> {API_CONFIG.BASE_URL}</p>
          <p><strong>Bin ID Compartilhado:</strong> {API_CONFIG.SHARED_BIN_ID}</p>
          <p><strong>Intervalo de sync:</strong> {API_CONFIG.SYNC_INTERVAL / 1000}s</p>
        </div>
      </div>
    </div>
  );
}
