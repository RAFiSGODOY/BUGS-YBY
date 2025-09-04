import { useState, useEffect } from 'react';
import { Database, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { supabaseService } from '../services/supabase';

interface SupabaseDataViewerProps {
  isAdmin: boolean;
}

export function SupabaseDataViewer({ isAdmin }: SupabaseDataViewerProps) {
  const [supabaseBugs, setSupabaseBugs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Buscando dados do Supabase...');
      const response = await supabaseService.getBugs();
      
      if (response.success && response.data) {
        setSupabaseBugs(response.data);
        setLastRefresh(new Date());
        console.log('✅ Dados do Supabase carregados:', response.data);
      } else {
        console.error('❌ Erro ao carregar dados do Supabase:', response.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  const completedBugs = supabaseBugs.filter(bug => bug.isFixed);
  const pendingBugs = supabaseBugs.filter(bug => !bug.isFixed);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Dados Atuais no Supabase</h3>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          title="Atualizar dados"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-500 mb-3">
          Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">Bugs Concluídos</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{completedBugs.length}</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <X className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">Bugs Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{pendingBugs.length}</div>
        </div>
      </div>

      {supabaseBugs.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-3 bg-gray-100 border-b">
            <h4 className="font-medium text-gray-800">Lista de Bugs no Supabase</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {supabaseBugs.map((bug, index) => (
              <div key={bug.id || index} className="p-3 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{bug.title}</span>
                      {bug.isFixed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Concluído
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Pendente
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {bug.id} | Criado: {new Date(bug.createdAt).toLocaleString('pt-BR')}
                      {bug.fixedAt && (
                        <span className="text-green-600">
                          {' '}| Corrigido: {new Date(bug.fixedAt).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {supabaseBugs.length === 0 && !isLoading && (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum bug encontrado no Supabase</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Carregando dados do Supabase...</p>
        </div>
      )}
    </div>
  );
}
