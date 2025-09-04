import { Header } from './components/Header';
import { BugForm } from './components/BugForm';
import { FilterTabs } from './components/FilterTabs';
import { BugList } from './components/BugList';
import { LoginForm } from './components/LoginForm';
import { SupabaseTest } from './components/SupabaseTest';
import { SupabaseSetup } from './components/SupabaseSetup';
import { useBugsSupabase } from './hooks/useBugsSupabase';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { SUPABASE_CONFIG } from './config/supabase';

function AppContent() {
  const {
    bugs,
    activeFilter,
    setActiveFilter,
    addBug,
    updateBug,
    deleteBug,
    isOnline,
    lastSync,
    isSyncing,
    syncToCloud,
    syncFromCloud
  } = useBugsSupabase();

  const { isAuthenticated, isLoading, user } = useAuth();

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

  const isSupabaseConfigured = SUPABASE_CONFIG.URL !== 'https://your-project.supabase.co' && SUPABASE_CONFIG.ANON_KEY !== 'your-anon-key-here';
  const isAdmin = user?.role === 'admin';

  // Calcular stats localmente (total, fixed, por categoria)
  const stats = {
    total: bugs.length,
    fixed: bugs.filter(b => b.isFixed).length,
    byCategory: bugs.reduce((acc: Record<string, number>, bug) => {
      acc[bug.category] = (acc[bug.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

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
          isAdmin={isAdmin}
        />
        
        {!isSupabaseConfigured && isAdmin && <SupabaseSetup />}

        {isSupabaseConfigured && isAdmin && (
          <SupabaseTest onForceSync={syncToCloud} />
        )}
        
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