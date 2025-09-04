import React from 'react';
import { Header } from './components/Header';
import { BugForm } from './components/BugForm';
import { FilterTabs } from './components/FilterTabs';
import { BugList } from './components/BugList';
import { LoginForm } from './components/LoginForm';
import { SetupInstructions } from './components/SetupInstructions';
import { useBugsSync } from './hooks/useBugsSync';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { API_CONFIG } from './config/api';

function AppContent() {
  const {
    bugs,
    activeFilter,
    setActiveFilter,
    addBug,
    updateBug,
    deleteBug,
    stats,
    isOnline,
    lastSync,
    isSyncing,
    syncToCloud,
    syncFromCloud
  } = useBugsSync();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const isApiKeyConfigured = API_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header 
          totalBugs={stats.total} 
          fixedBugs={stats.fixed}
          isOnline={isOnline}
          lastSync={lastSync}
          isSyncing={isSyncing}
          onSync={syncFromCloud}
        />
        
        {!isApiKeyConfigured && <SetupInstructions />}
        
        <BugForm onAdd={addBug} />
        
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          stats={stats.byCategory}
          totalCount={stats.total}
        />
        
        <BugList
          bugs={bugs}
          onUpdate={updateBug}
          onDelete={deleteBug}
          activeFilter={activeFilter}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;