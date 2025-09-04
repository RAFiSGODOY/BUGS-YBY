import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface SimpleTestProps {
  bugs: any[];
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function SimpleTest({ bugs, onUpdate, onDelete, isAdmin }: SimpleTestProps) {
  const [testResult, setTestResult] = useState<string>('');

  const testBasicFunctionality = () => {
    if (!isAdmin) {
      setTestResult('❌ Apenas admin pode testar');
      return;
    }

    if (bugs.length === 0) {
      setTestResult('❌ Nenhum bug para testar');
      return;
    }

    const testBug = bugs[0];
    setTestResult(`✅ Sistema funcionando! Bug encontrado: "${testBug.title}"`);
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Teste Básico</h3>
      </div>
      
      <button
        onClick={testBasicFunctionality}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
      >
        Testar Funcionalidades Básicas
      </button>

      {testResult && (
        <div className="mt-3 p-2 bg-white rounded border">
          <p className="text-sm">{testResult}</p>
        </div>
      )}
    </div>
  );
}
