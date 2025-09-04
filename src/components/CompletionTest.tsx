import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface CompletionTestProps {
  bugs: any[];
  onUpdate: (id: string, updates: any) => void;
  isAdmin: boolean;
}

export function CompletionTest({ bugs, onUpdate, isAdmin }: CompletionTestProps) {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testMarkAsCompleted = () => {
    if (!isAdmin) {
      setTestResult('❌ Apenas admin pode testar');
      return;
    }

    const uncompletedBugs = bugs.filter(bug => !bug.isFixed);
    if (uncompletedBugs.length === 0) {
      setTestResult('❌ Nenhum bug não concluído para testar');
      return;
    }

    const testBug = uncompletedBugs[0];
    setIsTesting(true);
    setTestResult('');

    console.log('🧪 Testando marcação como concluído:', testBug);

    try {
      // Marcar como concluído
      onUpdate(testBug.id, { isFixed: true });
      
      setTestResult(`✅ Bug "${testBug.title}" marcado como concluído! Verifique se ficou verde.`);
      
      // Desmarcar após 3 segundos
      setTimeout(() => {
        onUpdate(testBug.id, { isFixed: false });
        setTestResult(prev => prev + ' (Desmarcado automaticamente após 3s)');
        setIsTesting(false);
      }, 3000);

    } catch (error) {
      setTestResult(`❌ Erro: ${error}`);
      setIsTesting(false);
    }
  };

  if (!isAdmin) return null;

  const uncompletedBugs = bugs.filter(bug => !bug.isFixed);
  const completedBugs = bugs.filter(bug => bug.isFixed);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-green-800">Teste de Marcação como Concluído</h3>
      </div>
      
      <div className="mb-3 text-sm text-green-700">
        <p><strong>Bugs não concluídos:</strong> {uncompletedBugs.length}</p>
        <p><strong>Bugs concluídos:</strong> {completedBugs.length}</p>
      </div>

      <button
        onClick={testMarkAsCompleted}
        disabled={isTesting || uncompletedBugs.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center gap-2"
      >
        <Check className="h-4 w-4" />
        {isTesting ? 'Testando...' : 'Testar Marcação como Concluído'}
      </button>

      {testResult && (
        <div className="mt-3 p-3 bg-white rounded border">
          <p className="text-sm">{testResult}</p>
        </div>
      )}

      {uncompletedBugs.length > 0 && (
        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Bugs disponíveis para teste:</strong></p>
          <ul className="list-disc list-inside">
            {uncompletedBugs.slice(0, 3).map(bug => (
              <li key={bug.id}>{bug.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
