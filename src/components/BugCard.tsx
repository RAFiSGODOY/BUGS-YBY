import { useState } from 'react';
import { Check, Edit2, Trash2, Calendar, Flag, Lock, Eye, Download } from 'lucide-react';
import { Bug, BUG_CATEGORIES, PRIORITIES, PLATFORMS } from '../types/Bug';
import { useAuth } from '../hooks/useAuth';

interface BugCardProps {
  bug: Bug;
  onUpdate: (id: string, updates: Partial<Bug>) => void;
  onDelete: (id: string) => void;
}

export function BugCard({ bug, onUpdate, onDelete }: BugCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(bug.title);
  const [editDescription, setEditDescription] = useState(bug.description);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const handleSave = () => {
    onUpdate(bug.id, {
      title: editTitle.trim(),
      description: editDescription.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(bug.title);
    setEditDescription(bug.description);
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md ${
      bug.isFixed 
        ? 'border-green-200 bg-green-50/50' 
        : 'border-gray-200 hover:border-blue-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => isAdmin && onUpdate(bug.id, { isFixed: !bug.isFixed })}
              disabled={!isAdmin}
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                bug.isFixed
                  ? 'bg-green-500 border-green-500 text-white'
                  : isAdmin
                    ? 'border-gray-300 hover:border-blue-500 cursor-pointer'
                    : 'border-gray-200 cursor-not-allowed opacity-50'
              }`}
              title={isAdmin ? 'Marcar como corrigido' : 'Apenas administradores podem marcar como corrigido'}
            >
              {bug.isFixed ? <Check className="h-4 w-4" /> : !isAdmin && <Lock className="h-3 w-3" />}
            </button>
            
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                bug.category === 'interface' ? 'bg-blue-100 text-blue-800' :
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

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Editar bug"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(bug.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Excluir bug"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Salvar
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

        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Criado em {bug.createdAt.toLocaleDateString('pt-BR')}
          </div>
          {bug.isFixed && bug.fixedAt && (
            <div className="text-green-600 font-medium">
              Corrigido em {bug.fixedAt.toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}