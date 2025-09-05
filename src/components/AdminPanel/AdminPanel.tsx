import { useState } from 'react';
import { AdminLayout, AdminView } from './AdminLayout';
import { Dashboard } from '../Dashboard/Dashboard';
import { BugsManagement } from './views/BugsManagement';
import { UsersManagement } from './views/UsersManagement';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { Bug as BugType } from '../../types/Bug';

interface AdminPanelProps {
  bugs: BugType[];
  onCreateBug: () => void;
  onEditBug: (bug: BugType) => void;
  onDeleteBug: (bugId: string) => void;
  onToggleBugStatus: (bugId: string) => void;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AdminPanel({
  bugs,
  onCreateBug,
  onEditBug,
  onDeleteBug,
  onToggleBugStatus,
  userInfo = { name: 'Administrador', email: 'admin@bugmanager.com' }
}: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            bugs={bugs}
            onCreateBug={onCreateBug}
            onViewBugs={() => setCurrentView('bugs')}
          />
        );
      
      case 'bugs':
        return (
          <BugsManagement
            bugs={bugs}
            onCreateBug={onCreateBug}
            onEditBug={onEditBug}
            onDeleteBug={onDeleteBug}
            onToggleBugStatus={onToggleBugStatus}
          />
        );
      
      case 'users':
        return <UsersManagement />;
      
      case 'reports':
        return <ReportsView bugs={bugs} />;
      
      case 'settings':
        return <SettingsView />;
      
      case 'documentation':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Documentação</h2>
              <p className="text-gray-600">Guias e manuais do sistema</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documentação em Desenvolvimento</h3>
              <p className="text-gray-500">
                A documentação completa do sistema estará disponível em breve.
              </p>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Busca Avançada</h2>
              <p className="text-gray-600">Pesquise bugs, usuários e dados do sistema</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Busca Avançada em Desenvolvimento</h3>
              <p className="text-gray-500">
                Funcionalidades de busca avançada estarão disponíveis em breve.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <Dashboard
            bugs={bugs}
            onCreateBug={onCreateBug}
            onViewBugs={() => setCurrentView('bugs')}
          />
        );
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      userInfo={userInfo}
    >
      {renderCurrentView()}
    </AdminLayout>
  );
}