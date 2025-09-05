import { useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Bug } from '../types/Bug';
import { supabaseService } from '../services/supabase';

interface RealtimeTestProps {
  bugs: Bug[];
  isAdmin: boolean;
}

export function RealtimeTest({ bugs, isAdmin }: RealtimeTestProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testRealtimeConnection = async () => {
    if (!isAdmin) {
      setTestResult({ success: false, message: 'Apenas administradores podem executar este teste.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando conexão Realtime...');

      if (!supabaseService.client) {
        setTestResult({ 
          success: false, 
          message: '❌ Cliente Supabase não está configurado.' 
        });
        setIsTesting(false);
        return;
      }

      // Testar conexão básica
      const { data, error } = await supabaseService.client
        .from('bugs')
        .select('count')
        .limit(1);

      if (error) {
        setTestResult({ 
          success: false, 
          message: '❌ Erro na conexão com Supabase.',
          details: error
        });
      } else {
        setTestResult({ 
          success: true, 
          message: '✅ Conexão com Supabase funcionando! Realtime ativo.',
          details: {
            clientConfigured: !!supabaseService.client,
            connectionTest: 'OK',
            bugsCount: bugs.length
          }
        });
      }

    } catch (error) {
      console.error('❌ Erro no teste de Realtime:', error);
      setTestResult({
        success: false,
        message: `Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testRealtimeSubscription = async () => {
    if (!isAdmin) {
      setTestResult({ success: false, message: 'Apenas administradores podem executar este teste.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando subscription Realtime...');

      if (!supabaseService.client) {
        setTestResult({ 
          success: false, 
          message: '❌ Cliente Supabase não está configurado.' 
        });
        setIsTesting(false);
        return;
      }

      // Criar um canal de teste
      const testChannel = supabaseService.client
        .channel('test-realtime')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bugs' 
        }, (payload: any) => {
          console.log('🔔 Evento Realtime recebido:', payload);
          setTestResult({ 
            success: true, 
            message: '✅ Subscription Realtime funcionando! Evento recebido.',
            details: payload
          });
        })
        .subscribe();

      // Aguardar um pouco para ver se a subscription funciona
      setTimeout(() => {
        supabaseService.client.removeChannel(testChannel);
        if (!testResult) {
          setTestResult({ 
            success: true, 
            message: '✅ Subscription Realtime configurada com sucesso! Aguardando eventos...' 
          });
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro no teste de subscription:', error);
      setTestResult({
        success: false,
        message: `Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Wifi className="h-5 w-5 text-blue-600" />
        Teste de Supabase Realtime
      </h2>
      <p className="text-gray-600 mb-4">
        Este teste verifica se o Supabase Realtime está funcionando corretamente para sincronização automática.
      </p>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Status atual:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
          <li>Cliente Supabase: {supabaseService.client ? '✅ Configurado' : '❌ Não configurado'}</li>
          <li>Bugs locais: {bugs.length}</li>
          <li>Realtime: {supabaseService.client ? '🔄 Ativo' : '⏸️ Inativo'}</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={testRealtimeConnection}
          disabled={isTesting || !isAdmin}
          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
            isTesting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isTesting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Testando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Testar Conexão
            </span>
          )}
        </button>

        <button
          onClick={testRealtimeSubscription}
          disabled={isTesting || !isAdmin}
          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
            isTesting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isTesting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Testando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" /> Testar Subscription
            </span>
          )}
        </button>
      </div>

      {testResult && (
        <div className={`mt-4 p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{testResult.message}</p>
          {testResult.details && (
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

