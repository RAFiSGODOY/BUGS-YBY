import { useState } from 'react';
import { Check, X, Database, RefreshCw } from 'lucide-react';
import { supabaseService } from '../services/supabase';

interface SupabaseCompletionTestProps {
  bugs: any[];
  isAdmin: boolean;
}

export function SupabaseCompletionTest({ bugs, isAdmin }: SupabaseCompletionTestProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testSupabaseCompletion = async () => {
    if (!isAdmin) {
      setTestResults({
        success: false,
        message: 'Apenas administradores podem testar esta funcionalidade'
      });
      return;
    }

    const uncompletedBugs = bugs.filter(bug => !bug.isFixed);
    if (uncompletedBugs.length === 0) {
      setTestResults({
        success: false,
        message: 'Não há bugs não concluídos para testar'
      });
      return;
    }

    const testBug = uncompletedBugs[0];
    setIsTesting(true);
    setTestResults(null);

    try {
      console.log('🧪 Testando salvamento no Supabase:', testBug);

      // 1. Marcar bug como concluído
      const updatedBug = {
        ...testBug,
        isFixed: true,
        fixedAt: new Date()
      };

      console.log('📤 Enviando bug atualizado para Supabase:', updatedBug);

      // 2. Atualizar no Supabase
      const response = await supabaseService.updateBug(updatedBug);

      if (response.success) {
        console.log('✅ Bug atualizado no Supabase com sucesso');

        // 3. Buscar o bug atualizado do Supabase para verificar
        console.log('🔍 Buscando bug atualizado do Supabase...');
        const getResponse = await supabaseService.getBugs();

        if (getResponse.success && getResponse.data) {
          const updatedBugFromSupabase = getResponse.data.find(b => b.id === testBug.id);
          
          if (updatedBugFromSupabase) {
            const isCorrectlySaved = updatedBugFromSupabase.isFixed === true;
            
            setTestResults({
              success: isCorrectlySaved,
              message: isCorrectlySaved 
                ? '✅ Bug salvo corretamente no Supabase como concluído!'
                : '❌ Bug não foi salvo corretamente no Supabase',
              details: {
                originalBug: testBug,
                updatedBug: updatedBug,
                supabaseResponse: response,
                bugFromSupabase: updatedBugFromSupabase,
                isCorrectlySaved,
                allBugsFromSupabase: getResponse.data
              }
            });
          } else {
            setTestResults({
              success: false,
              message: '❌ Bug não encontrado no Supabase após atualização',
              details: {
                originalBug: testBug,
                updatedBug: updatedBug,
                supabaseResponse: response,
                allBugsFromSupabase: getResponse.data
              }
            });
          }
        } else {
          setTestResults({
            success: false,
            message: '❌ Erro ao buscar bugs do Supabase para verificação',
            details: {
              originalBug: testBug,
              updatedBug: updatedBug,
              supabaseResponse: response,
              getResponse
            }
          });
        }
      } else {
        setTestResults({
          success: false,
          message: `❌ Erro ao atualizar bug no Supabase: ${response.error}`,
          details: {
            originalBug: testBug,
            updatedBug: updatedBug,
            supabaseResponse: response
          }
        });
      }

    } catch (error) {
      setTestResults({
        success: false,
        message: `❌ Erro no teste: ${error}`,
        details: { error }
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Teste de Salvamento no Supabase</h3>
      </div>
      
      <p className="text-sm text-blue-700 mb-3">
        Teste se bugs marcados como concluídos estão sendo salvos corretamente no Supabase
      </p>

      <button
        onClick={testSupabaseCompletion}
        disabled={isTesting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center gap-2"
      >
        {isTesting ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            Testar Salvamento no Supabase
          </>
        )}
      </button>

      {testResults && (
        <div className={`mt-3 p-3 rounded-lg ${
          testResults.success 
            ? 'bg-green-100 border border-green-200' 
            : 'bg-red-100 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {testResults.success ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              testResults.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResults.message}
            </span>
          </div>
          
          {testResults.details && (
            <div className="mt-2 text-xs text-gray-600">
              <details>
                <summary className="cursor-pointer font-medium">Ver detalhes técnicos</summary>
                <pre className="bg-white p-2 rounded border overflow-x-auto mt-2 max-h-60">
                  {JSON.stringify(testResults.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
