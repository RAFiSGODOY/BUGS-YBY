import { useState, useEffect, useCallback } from 'react';
import { Bug, BugCategory } from '../types/Bug';
import { supabaseService } from '../services/supabase';
import { SUPABASE_CONFIG } from '../config/supabase';

export function useBugsSupabase() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [activeFilter, setActiveFilter] = useState<BugCategory | 'todos'>('todos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastLocalUpdate, setLastLocalUpdate] = useState<Date | null>(null);
  const [syncDisabled, setSyncDisabled] = useState(false);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar bugs do localStorage na inicialização
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!isOnline) return;

    console.log('🔄 Configurando sincronização em tempo real...');
    
    // Carregar dados iniciais da nuvem
    loadFromCloud();

    // Configurar WebSocket para tempo real (simulado com polling otimizado)
    const realtimeInterval = setInterval(() => {
      syncFromCloud();
    }, 2000); // Sincronização a cada 2 segundos

    return () => {
      clearInterval(realtimeInterval);
      console.log('⏹️ Sincronização em tempo real desativada');
    };
  }, [isOnline, lastLocalUpdate]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('yby-bugs');
      if (stored) {
        const parsedBugs = JSON.parse(stored).map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));
        setBugs(parsedBugs);
        console.log('📱 Bugs carregados do localStorage:', parsedBugs.length);
      }
    } catch (error) {
      console.error('Erro ao carregar bugs do localStorage:', error);
    }
  };

  const saveToLocalStorage = (bugsToSave: Bug[]) => {
    try {
      localStorage.setItem('yby-bugs', JSON.stringify(bugsToSave));
      console.log('💾 Bugs salvos no localStorage:', bugsToSave.length);
    } catch (error) {
      console.error('Erro ao salvar bugs no localStorage:', error);
    }
  };

  const loadFromCloud = async () => {
    if (!isOnline) return;

    console.log('☁️ Carregando bugs da nuvem...');
    setIsSyncing(true);
    try {
      const response = await supabaseService.getBugs();
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));

        // Mesclar bugs locais com os da nuvem
        const mergedBugs = mergeBugs(bugs, cloudBugs);
        setBugs(mergedBugs);
        saveToLocalStorage(mergedBugs);
        setLastSync(new Date());
        console.log('✅ Bugs carregados da nuvem:', { 
          localBugs: bugs.length, 
          cloudBugs: cloudBugs.length, 
          mergedBugs: mergedBugs.length 
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar da nuvem:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromCloud = async () => {
    if (!isOnline || isSyncing || syncDisabled) {
      console.log('⏸️ Sincronização pausada:', { isOnline, isSyncing, syncDisabled });
      return;
    }

    // Não sincronizar se houve mudanças locais recentes (últimos 15 segundos)
    if (lastLocalUpdate && (Date.now() - lastLocalUpdate.getTime()) < 15000) {
      console.log('⏸️ Pulando sincronização - mudanças locais recentes (proteção de 15s)');
      return;
    }

    try {
      const response = await supabaseService.getBugs();
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const cloudBugs = dataArray.map((bug: any) => ({
          ...bug,
          createdAt: new Date(bug.createdAt),
          fixedAt: bug.fixedAt ? new Date(bug.fixedAt) : undefined,
        }));

        // Verificar se há mudanças
        const hasChanges = checkForChanges(bugs, cloudBugs);
        if (hasChanges) {
          const mergedBugs = mergeBugs(bugs, cloudBugs);
          setBugs(mergedBugs);
          saveToLocalStorage(mergedBugs);
          setLastSync(new Date());
          console.log('🔄 Sincronização em tempo real:', { 
            localBugs: bugs.length, 
            cloudBugs: cloudBugs.length, 
            mergedBugs: mergedBugs.length 
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro na sincronização em tempo real:', error);
    }
  };

  const checkForChanges = (localBugs: Bug[], cloudBugs: Bug[]): boolean => {
    if (localBugs.length !== cloudBugs.length) return true;
    
    for (const cloudBug of cloudBugs) {
      const localBug = localBugs.find(b => b.id === cloudBug.id);
      if (!localBug) return true;
    }
    
    return false;
  };

  const mergeBugs = (localBugs: Bug[], cloudBugs: Bug[]): Bug[] => {
    const merged = new Map<string, Bug>();

    console.log('🔄 Iniciando merge:', { 
      localBugs: localBugs.length, 
      cloudBugs: cloudBugs.length,
      lastLocalUpdate: lastLocalUpdate?.toISOString()
    });

    // Adicionar bugs locais primeiro (prioridade absoluta)
    localBugs.forEach(bug => {
      merged.set(bug.id, bug);
      console.log('📱 Bug local preservado:', { id: bug.id, isFixed: bug.isFixed });
    });

    // Adicionar bugs da nuvem apenas se não existir localmente
    cloudBugs.forEach(cloudBug => {
      if (!merged.has(cloudBug.id)) {
        merged.set(cloudBug.id, cloudBug);
        console.log('☁️ Bug da nuvem adicionado (novo):', { id: cloudBug.id, isFixed: cloudBug.isFixed });
      } else {
        console.log('🛡️ Bug local mantido (ignorando nuvem):', { 
          id: cloudBug.id, 
          localIsFixed: merged.get(cloudBug.id)?.isFixed,
          cloudIsFixed: cloudBug.isFixed 
        });
      }
    });

    const result = Array.from(merged.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    console.log('✅ Merge concluído:', { totalBugs: result.length });
    return result;
  };

  const addBug = useCallback(async (bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Adicionar localmente primeiro
    setBugs(prev => {
      const updated = [newBug, ...prev];
      saveToLocalStorage(updated);
      setLastLocalUpdate(new Date()); // Marcar que houve mudança local
      
      // Desabilitar sincronização temporariamente
      setSyncDisabled(true);
      setTimeout(() => setSyncDisabled(false), 20000);
      
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline) {
      try {
        const response = await supabaseService.addBug(newBug);
        if (response.success) {
          console.log('✅ Bug adicionado à nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao adicionar bug à nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar bug:', error);
      }
    }
  }, [isOnline]);

  const updateBug = useCallback(async (id: string, updates: Partial<Bug>) => {
    console.log('🔄 Iniciando atualização do bug:', { id, updates });
    console.log('📊 Bugs disponíveis:', bugs.map(b => ({ id: b.id, title: b.title, isFixed: b.isFixed })));
    
    // Log específico para marcação como concluído
    if (updates.isFixed !== undefined) {
      console.log('✅ Marcando bug como concluído:', { id, isFixed: updates.isFixed });
    }
    
    // Encontrar o bug atual para comparação
    const currentBug = bugs.find(b => b.id === id);
    if (currentBug) {
      console.log('📋 Bug atual encontrado:', { 
        id: currentBug.id, 
        title: currentBug.title, 
        isFixed: currentBug.isFixed,
        fixedAt: currentBug.fixedAt 
      });
    } else {
      console.error('❌ Bug não encontrado para atualização:', { id });
      console.error('❌ Bugs disponíveis:', bugs.map(b => b.id));
      return;
    }
    
    let updatedBug: Bug | null = null;

    // Atualizar localmente primeiro
    setBugs(prev => {
      console.log('🔄 Iniciando atualização local:', { 
        id, 
        updates, 
        previousBugs: prev.map(b => ({ id: b.id, isFixed: b.isFixed }))
      });
      
      const updated = prev.map(bug => {
        if (bug.id === id) {
          console.log('🎯 Encontrou bug para atualizar:', { 
            id: bug.id, 
            currentIsFixed: bug.isFixed, 
            newIsFixed: updates.isFixed 
          });
          
          // Lógica melhorada para fixedAt
          let fixedAt = bug.fixedAt;
          if (updates.isFixed === true && !bug.isFixed) {
            // Marcando como concluído pela primeira vez
            fixedAt = new Date();
            console.log('🎯 Bug marcado como concluído pela primeira vez:', fixedAt);
          } else if (updates.isFixed === false && bug.isFixed) {
            // Desmarcando como concluído
            fixedAt = undefined;
            console.log('🔄 Bug desmarcado como concluído');
          }
          
          updatedBug = { 
            ...bug, 
            ...updates,
            fixedAt
          };
          console.log('📝 Bug atualizado localmente:', { 
            id: updatedBug.id, 
            title: updatedBug.title, 
            isFixed: updatedBug.isFixed, 
            fixedAt: updatedBug.fixedAt 
          });
          return updatedBug;
        }
        return bug;
      });
      
      console.log('💾 Salvando bugs atualizados:', updated.map(b => ({ id: b.id, isFixed: b.isFixed })));
      saveToLocalStorage(updated);
      setLastLocalUpdate(new Date()); // Marcar que houve mudança local
      
      // Desabilitar sincronização temporariamente para evitar sobrescrita
      setSyncDisabled(true);
      setTimeout(() => {
        setSyncDisabled(false);
        console.log('🔄 Sincronização reabilitada após mudança local');
      }, 20000); // 20 segundos de proteção
      
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline && updatedBug) {
      try {
        console.log('☁️ Sincronizando atualização com a nuvem...');
        const response = await supabaseService.updateBug(updatedBug);
        if (response.success) {
          console.log('✅ Bug atualizado na nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao atualizar bug na nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar atualização:', error);
      }
    } else {
      console.log('⏸️ Sincronização offline ou bug não encontrado');
    }
  }, [isOnline, bugs]);

  const deleteBug = useCallback(async (id: string) => {
    console.log('🗑️ Iniciando exclusão do bug:', { id });
    
    // Encontrar o bug que será excluído
    const bugToDelete = bugs.find(b => b.id === id);
    if (bugToDelete) {
      console.log('📋 Bug a ser excluído encontrado:', { 
        id: bugToDelete.id, 
        title: bugToDelete.title, 
        isFixed: bugToDelete.isFixed 
      });
    } else {
      console.error('❌ Bug não encontrado para exclusão:', { id });
      return;
    }
    
    // Remover localmente primeiro
    setBugs(prev => {
      const updated = prev.filter(bug => bug.id !== id);
      console.log('📝 Bug removido localmente:', { 
        id, 
        title: bugToDelete?.title,
        remainingBugs: updated.length,
        previousCount: prev.length 
      });
      saveToLocalStorage(updated);
      setLastLocalUpdate(new Date()); // Marcar que houve mudança local
      
      // Desabilitar sincronização temporariamente
      setSyncDisabled(true);
      setTimeout(() => setSyncDisabled(false), 20000);
      
      return updated;
    });

    // Sincronizar com a nuvem imediatamente
    if (isOnline) {
      try {
        console.log('☁️ Sincronizando exclusão com a nuvem...');
        const response = await supabaseService.deleteBug(id);
        if (response.success) {
          console.log('✅ Bug removido da nuvem em tempo real');
          setLastSync(new Date());
        } else {
          console.error('❌ Erro ao remover bug da nuvem:', response.error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar remoção:', error);
      }
    } else {
      console.log('⏸️ Sincronização offline');
    }
  }, [isOnline, bugs]);

  const filteredBugs = bugs.filter(bug => 
    activeFilter === 'todos' || bug.category === activeFilter
  );

  return {
    bugs: filteredBugs,
    activeFilter,
    setActiveFilter,
    addBug,
    updateBug,
    deleteBug,
    isOnline,
    lastSync,
    isSyncing,
  };
}