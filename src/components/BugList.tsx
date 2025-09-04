import React from 'react';
import { Search, AlertCircle, Check } from 'lucide-react';
import { Bug } from '../types/Bug';
import { BugCard } from './BugCard';

interface BugListProps {
  bugs: Bug[];
  onUpdate: (id: string, updates: Partial<Bug>) => void;
  onDelete: (id: string) => void;
  activeFilter: string;
}

export function BugList({ bugs, onUpdate, onDelete, activeFilter }: BugListProps) {
  if (bugs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilter === 'todos' ? 'Nenhum bug encontrado' : `Nenhum bug na categoria "${activeFilter}"`}
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'todos' 
                ? 'Que ótimo! Não há bugs cadastrados no momento.'
                : 'Tente selecionar outra categoria ou adicione um novo bug.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingBugs = bugs.filter(bug => !bug.isFixed);
  const fixedBugs = bugs.filter(bug => bug.isFixed);

  return (
    <div className="space-y-6">
      {pendingBugs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Pendentes ({pendingBugs.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {pendingBugs.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {fixedBugs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Check className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Corrigidos ({fixedBugs.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {fixedBugs.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}