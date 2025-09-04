import React from 'react';
import { Bug, Target, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  totalBugs: number;
  fixedBugs: number;
}

export function Header({ totalBugs, fixedBugs }: HeaderProps) {
  const { user, logout } = useAuth();
  const progressPercentage = totalBugs > 0 ? (fixedBugs / totalBugs) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Bug className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">YBY BUGS A CORRIGIR</h1>
            <p className="text-gray-600 mt-1">Sistema de gerenciamento de bugs</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalBugs}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{fixedBugs}</div>
            <div className="text-sm text-gray-500">Corrigidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalBugs - fixedBugs}</div>
            <div className="text-sm text-gray-500">Pendentes</div>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-2">
              {user?.role === 'admin' ? (
                <Shield className="h-5 w-5 text-purple-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {totalBugs > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Progresso geral</span>
            <span className="text-sm text-gray-500">({progressPercentage.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}