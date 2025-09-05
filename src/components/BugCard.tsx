import { useState } from 'react';
import { Check, Calendar, Flag, Lock, Eye, Download } from 'lucide-react';
import { Bug, BUG_CATEGORIES, PRIORITIES, PLATFORMS } from '../types/Bug';
import { useAuth } from '../hooks/useAuth';

interface BugCardProps {
  bug: Bug;
  onUpdate: (id: string, updates: Partial<Bug>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function BugCard({ bug, onUpdate, onDelete }: BugCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(bug.title);
  const [editDescription, setEditDescription] = useState(bug.description);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const handleSave = async () => {
    console.log('💾 Salvando alterações do bug:', {
      id: bug.id,
      oldTitle: bug.title,
      newTitle: editTitle.trim(),
      oldDescription: bug.description,
      newDescription: editDescription.trim()
    });

    setIsUpdating(true);
    try {
      await onUpdate(bug.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(bug.title);
    setEditDescription(bug.description);
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md ${bug.isFixed
      ? 'border-green-200 bg-green-50/50'
      : 'border-gray-200 hover:border-blue-200'
      }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (isAdmin && !isUpdating) {
                  console.log(`🚀 ${!bug.isFixed ? 'APROVANDO' : 'DESMARCANDO'} bug - Aguardando sincronização...`);
                  setIsUpdating(true);
                  try {
                    await onUpdate(bug.id, { isFixed: !bug.isFixed });
                  } catch (error) {
                    console.error('❌ Erro ao atualizar status:', error);
                  } finally {
                    setIsUpdating(false);
                  }
                }
              }}
              disabled={!isAdmin || isUpdating}
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${isUpdating
                ? 'bg-gray-200 border-gray-300 cursor-wait'
                : bug.isFixed
                  ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 shadow-lg'
                  : isAdmin
                    ? 'border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer hover:shadow-md'
                    : 'border-gray-200 cursor-not-allowed opacity-50'
                }`}
              title={
                isUpdating
                  ? 'Sincronizando...'
                  : isAdmin
                    ? (bug.isFixed ? 'Desmarcar como corrigido' : 'Marcar como corrigido')
                    : 'Apenas administradores podem marcar como corrigido'
              }
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
              ) : bug.isFixed ? (
                <Check className="h-4 w-4" />
              ) : !isAdmin ? (
                <Lock className="h-3 w-3" />
              ) : null}
            </button>

            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${bug.category === 'interface' ? 'bg-blue-100 text-blue-800' :
                bug.category === 'ux' ? 'bg-purple-100 text-purple-800' :
                  bug.category === 'logica' ? 'bg-red-100 text-red-800' :
                    bug.category === 'performance' ? 'bg-yellow-100 text-yellow-800' :
                      bug.category === 'seguranca' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                }`}>
                {BUG_CATEGORIES[bug.category]}
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${PRIORITIES[bug.priority].color}`}>
                <Flag className="h-3 w-3" />
                {PRIORITIES[bug.priority].label}
              </span>

              {bug.platform && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${PLATFORMS[bug.platform].color}`}>
                  {PLATFORMS[bug.platform].icon} {PLATFORMS[bug.platform].label}
                </span>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isUpdating}
                  className={`p-1.5 transition-colors duration-200 rounded-lg ${isUpdating
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  title={isUpdating ? 'Aguarde a sincronização...' : 'Editar bug'}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {onDelete && (
                  <button
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja excluir este bug?') && !isUpdating) {
                        console.log('🗑️ Excluindo bug:', bug.id);
                        setIsUpdating(true);
                        try {
                          await onDelete(bug.id);
                        } catch (error) {
                          console.error('❌ Erro ao excluir:', error);
                        } finally {
                          setIsUpdating(false);
                        }
                      }
                    }}
                    disabled={isUpdating}
                    className={`p-1.5 transition-colors duration-200 rounded-lg ${isUpdating
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    title={isUpdating ? 'Aguarde a sincronização...' : 'Excluir bug'}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Título do bug"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição do bug"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2 ${isUpdating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isUpdating ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${bug.isFixed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {bug.title}
            </h3>
            {bug.description && (
              <p className={`text-gray-600 mb-3 ${bug.isFixed ? 'line-through' : ''}`}>
                {bug.description}
              </p>
            )}

            {/* Screenshot */}
            {bug.screenshot && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">📸 Screenshot:</span>
                  <button
                    onClick={() => setShowScreenshot(!showScreenshot)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Eye className="h-3 w-3" />
                    {showScreenshot ? 'Ocultar' : 'Ver'}
                  </button>
                  <a
                    href={bug.screenshot}
                    download="bug-screenshot.png"
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200"
                  >
                    <Download className="h-3 w-3" />
                    Baixar
                  </a>
                </div>

                {showScreenshot && (
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img
                      src={bug.screenshot}
                      alt="Screenshot do bug"
                      className="max-w-full h-auto max-h-48 rounded shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Criado em {bug.createdAt.toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                v{bug.version}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>👤 Por: <strong>{bug.createdBy}</strong></span>
            </div>
            {bug.lastModifiedBy && bug.lastModifiedAt && (
              <div className="text-xs text-gray-400">
                Editado por <strong>{bug.lastModifiedBy}</strong> em {bug.lastModifiedAt.toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>

          {bug.isFixed && bug.fixedAt && (
            <div className="text-green-600 font-medium flex items-center gap-1 text-sm">
              <Check className="h-3 w-3" />
              Corrigido em {bug.fixedAt.toLocaleDateString('pt-BR')} às {bug.fixedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}