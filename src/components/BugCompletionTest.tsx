import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface BugCompletionTestProps {
  bugs: any[];
  onUpdate: (id: string, updates: any) => void;
  isAdmin: boolean;
}

export function BugCompletionTest({ bugs, onUpdate, isAdmin }: BugCompletionTestProps) {
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testBugCompletion = () => {
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
    console.log('🧪 Testando marcação de bug como concluído:', testBug);

    try {
      // Marcar como concluído
      onUpdate(testBug.id, { isFixed: true });
      
      setTestResults({
        success: true,
        message: `Bug "${testBug.title}" marcado como concluído com sucesso!`,
        details: {
          bugId: testBug.id,
          bugTitle: testBug.title,
          timestamp: new Date().toISOString()
        }
      });

      // Desmarcar após 3 segundos para teste
      setTimeout(() => {
        onUpdate(testBug.id, { isFixed: false });
        console.log('🔄 Bug desmarcado automaticamente para teste');
      }, 3000);

    } catch (error) {
      setTestResults({
        success: false,
        message: `Erro ao marcar bug como concluído: ${error}`,
        details: { error }
      });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">Teste de Marcação de Bugs</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-3">
        Teste a funcionalidade de marcar bugs como concluídos
      </p>

      <button
        onClick={testBugCompletion}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
      >
        Testar Marcação de Bug
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
              <pre className="bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify(testResults.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
