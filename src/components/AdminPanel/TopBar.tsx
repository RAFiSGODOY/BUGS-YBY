import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import { AdminView } from './AdminLayout';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface TopBarProps {
  onMenuClick: () => void;
  userInfo: {
    name: string;
    email: string;
    avatar?: string;
  };
  currentView: AdminView;
  menuItems: MenuItem[];
}

export function TopBar({ onMenuClick, userInfo, currentView, menuItems }: TopBarProps) {
  const currentMenuItem = menuItems.find(item => item.id === currentView);
  
  const getViewTitle = (view: AdminView) => {
    switch (view) {
      case 'dashboard':
        return 'Dashboard';
      case 'bugs':
        return 'Gerenciamento de Bugs';
      case 'users':
        return 'Gerenciamento de Usuários';
      case 'reports':
        return 'Relatórios e Análises';
      case 'settings':
        return 'Configurações do Sistema';
      case 'documentation':
        return 'Documentação';
      case 'search':
        return 'Busca Avançada';
      default:
        return 'Painel Administrativo';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm lg:pl-64">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getViewTitle(currentView)}
            </h1>
            {currentMenuItem && (
              <p className="text-sm text-gray-500 mt-0.5">
                {currentMenuItem.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt={userInfo.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {userInfo.name}
                </div>
                <div className="text-xs text-gray-500">
                  Administrador
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb - Optional */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Painel</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">
            {getViewTitle(currentView)}
          </span>
        </nav>
      </div>
    </header>
  );
}