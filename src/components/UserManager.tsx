import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../types/User';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user'
  });

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Carregar usuários
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Criar usuário
  const handleCreateUser = async () => {
    if (!newUser.id.trim() || !newUser.name.trim()) return;

    try {
      const response = await userService.createUser({
        id: newUser.id.trim(),
        name: newUser.name.trim(),
        email: newUser.email.trim() || undefined,
        role: newUser.role,
        isActive: true
      });

      if (response.success) {
        await loadUsers();
        setNewUser({ id: '', name: '', email: '', role: 'user' });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
    }
  };

  // Atualizar usuário
  const handleUpdateUser = async (user: User, updates: Partial<User>) => {
    try {
      const response = await userService.updateUser(user.id, updates);
      if (response.success) {
        await loadUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
    }
  };

  // Ativar/Desativar usuário
  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await userService.deactivateUser(user.id);
      } else {
        await userService.activateUser(user.id);
      }
      await loadUsers();
    } catch (error) {
      console.error('❌ Erro ao alterar status do usuário:', error);
    }
  };

  // Deletar usuário
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Tem certeza que deseja deletar permanentemente o usuário "${user.name}"?`)) {
      return;
    }

    try {
      const response = await userService.deleteUser(user.id);
      if (response.success) {
        await loadUsers();
      }
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gerenciar Usuários</h3>
            <p className="text-sm text-gray-600">
              {users.length} usuários cadastrados
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {/* Formulário de criação */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Criar Novo Usuário</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="ID do usuário"
              value={newUser.id}
              onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              Criar
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewUser({ id: '', name: '', email: '', role: 'user' });
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando usuários...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                user.isActive 
                  ? 'border-gray-200 bg-white' 
                  : 'border-gray-100 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                    {!user.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{user.id} {user.email && `• ${user.email}`}
                  </div>
                  {user.lastLogin && (
                    <div className="text-xs text-gray-400">
                      Último login: {user.lastLogin.toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleUserStatus(user)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    user.isActive
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                >
                  {user.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Editar usuário"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Deletar usuário"
                  disabled={user.id === currentUser?.id}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Editar Usuário</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleUpdateUser(editingUser, {
                  name: editingUser.name,
                  email: editingUser.email,
                  role: editingUser.role
                })}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}