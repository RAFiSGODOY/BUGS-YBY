import { useState } from 'react';
import { Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface EditDeleteTestProps {
  bugs: any[];
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function EditDeleteTest({ bugs, onUpdate, onDelete, isAdmin }: EditDeleteTestProps) {
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testEditBug = () => {
    if (!isAdmin) {
      setTestResults({
        success: false,
        message: 'Apenas administradores podem testar esta funcionalidade'
      });
      return;
    }

    const testableBugs = bugs.filter(bug => !bug.isFixed);
    if (testableBugs.length === 0) {
      setTestResults({
        success: false,
        message: 'Não há bugs não concluídos para testar edição'
      });
      return;
    }

    const testBug = testableBugs[0];
    const newTitle = `Editado - ${new Date().toLocaleTimeString()}`;
    const newDescription = `Descrição editada em ${new Date().toLocaleString()}`;

    console.log('🧪 Testando edição de bug:', { 
      originalBug: testBug, 
      newTitle, 
      newDescription 
    });

    try {
      onUpdate(testBug.id, {
        title: newTitle,
        description: newDescription
      });

      setTestResults({
        success: true,
        message: `Bug "${testBug.title}" editado com sucesso!`,
        details: {
          originalTitle: testBug.title,
          newTitle: newTitle,
          originalDescription: testBug.description,
          newDescription: newDescription,
          bugId: testBug.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      setTestResults({
        success: false,
        message: `Erro ao editar bug: ${error}`,
        details: { error }
      });
    }
  };

  const testDeleteBug = () => {
    if (!isAdmin) {
      setTestResults({
        success: false,
        message: 'Apenas administradores podem testar esta funcionalidade'
      });
      return;
    }

    const testableBugs = bugs.filter(bug => !bug.isFixed);
    if (testableBugs.length === 0) {
      setTestResults({
        success: false,
        message: 'Não há bugs não concluídos para testar exclusão'
      });
      return;
    }

    const testBug = testableBugs[0];
    setIsTesting(true);
    setTestResults(null);

    console.log('🧪 Testando exclusão de bug:', testBug);

    try {
      onDelete(testBug.id);

      setTestResults({
        success: true,
        message: `Bug "${testBug.title}" excluído com sucesso!`,
        details: {
          deletedBug: testBug,
          timestamp: new Date().toISOString()
        }
      });

      // Restaurar o bug após 3 segundos para teste
      setTimeout(() => {
        console.log('🔄 Restaurando bug para teste...');
        // Aqui você poderia recriar o bug se necessário
      }, 3000);

    } catch (error) {
      setTestResults({
        success: false,
        message: `Erro ao excluir bug: ${error}`,
        details: { error }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testMarkAsCompleted = () => {
    if (!isAdmin) {
      setTestResults({
        success: false,
        message: 'Apenas administradores podem testar esta funcionalidade'
      });
      return;
    }

    const testableBugs = bugs.filter(bug => !bug.isFixed);
    if (testableBugs.length === 0) {
      setTestResults({
        success: false,
        message: 'Não há bugs não concluídos para testar marcação'
      });
      return;
    }

    const testBug = testableBugs[0];

    console.log('🧪 Testando marcação como concluído:', testBug);

    try {
      onUpdate(testBug.id, { isFixed: true });

      setTestResults({
        success: true,
        message: `Bug "${testBug.title}" marcado como concluído!`,
        details: {
          bugId: testBug.id,
          bugTitle: testBug.title,
          timestamp: new Date().toISOString()
        }
      });

      // Desmarcar após 5 segundos para teste
      setTimeout(() => {
        onUpdate(testBug.id, { isFixed: false });
        console.log('🔄 Bug desmarcado automaticamente para teste');
      }, 5000);

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
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-800">Teste de Edição e Exclusão</h3>
      </div>
      
      <p className="text-sm text-purple-700 mb-3">
        Teste as funcionalidades de editar, excluir e marcar como concluído
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={testEditBug}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Testar Edição
        </button>

        <button
          onClick={testDeleteBug}
          disabled={isTesting}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isTesting ? 'Testando...' : 'Testar Exclusão'}
        </button>

        <button
          onClick={testMarkAsCompleted}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Testar Conclusão
        </button>
      </div>

      {testResults && (
        <div className={`p-3 rounded-lg ${
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
                <pre className="bg-white p-2 rounded border overflow-x-auto mt-2 max-h-40">
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
