import { useState } from 'react';
import { Settings, Check, X } from 'lucide-react';
import { useAppVersion } from '../hooks/useAppVersion';

export function VersionManager() {
  const { currentVersion, updateVersion, canUpdateVersion } = useAppVersion();
  const [isEditing, setIsEditing] = useState(false);
  const [newVersion, setNewVersion] = useState(currentVersion);

  if (!canUpdateVersion) {
    return null;
  }

  const handleSave = () => {
    if (updateVersion(newVersion)) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewVersion(currentVersion);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Versão do App</h3>
            <p className="text-sm text-gray-600">
              Versão atual: <span className="font-mono font-medium">{currentVersion}</span>
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => {
              setIsEditing(true);
              setNewVersion(currentVersion);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Alterar Versão
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              placeholder="Ex: 1.0.1"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono w-24"
            />
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              title="Salvar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              title="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Importante:</strong> Todos os novos bugs serão criados com a versão atual. 
          Altere a versão quando lançar uma nova versão do app.
        </p>
      </div>
    </div>
  );
}