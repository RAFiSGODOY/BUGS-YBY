import { AlertTriangle, Clock, CheckCircle, Info, X } from 'lucide-react';
import { Bug as BugType } from '../../types/Bug';
import { useState } from 'react';

interface AlertsPanelProps {
  bugs: BugType[];
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  dismissible?: boolean;
}

export function AlertsPanel({ bugs }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Bugs críticos não resolvidos há mais de 7 dias
    const criticalOldBugs = bugs.filter(bug => {
      if (bug.isFixed || bug.priority !== 'alta') return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bug.createdAt < weekAgo;
    });

    if (criticalOldBugs.length > 0) {
      alerts.push({
        id: 'critical-old-bugs',
        type: 'critical',
        title: 'Bugs Críticos Pendentes',
        message: `${criticalOldBugs.length} bug(s) de alta prioridade não resolvidos há mais de 7 dias`,
        dismissible: true
      });
    }

    // Muitos bugs novos esta semana
    const thisWeekBugs = bugs.filter(bug => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bug.createdAt >= weekAgo;
    });

    if (thisWeekBugs.length > 10) {
      alerts.push({
        id: 'many-new-bugs',
        type: 'warning',
        title: 'Alto Volume de Bugs',
        message: `${thisWeekBugs.length} novos bugs reportados esta semana. Considere revisar os processos.`,
        dismissible: true
      });
    }

    // Taxa de resolução baixa
    const totalBugs = bugs.length;
    const fixedBugs = bugs.filter(bug => bug.isFixed).length;
    const fixRate = totalBugs > 0 ? (fixedBugs / totalBugs) * 100 : 0;

    if (fixRate < 50 && totalBugs > 5) {
      alerts.push({
        id: 'low-fix-rate',
        type: 'warning',
        title: 'Taxa de Resolução Baixa',
        message: `Apenas ${Math.round(fixRate)}% dos bugs foram resolvidos. Meta recomendada: 80%+`,
        dismissible: true
      });
    }

    // Boa performance
    const recentlyFixed = bugs.filter(bug => {
      if (!bug.fixedAt) return false;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return bug.fixedAt >= threeDaysAgo;
    });

    if (recentlyFixed.length >= 5) {
      alerts.push({
        id: 'good-performance',
        type: 'success',
        title: 'Excelente Performance!',
        message: `${recentlyFixed.length} bugs foram resolvidos nos últimos 3 dias. Continue assim!`,
        dismissible: true
      });
    }

    // Informação geral
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-good',
        type: 'info',
        title: 'Sistema Estável',
        message: 'Nenhum alerta crítico no momento. Sistema funcionando normalmente.',
        dismissible: false
      });
    }

    return alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  };

  const alerts = generateAlerts();

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'warning':
        return {
          container: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          message: 'text-orange-700'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700'
        };
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
        return <Clock className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Notificações</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          return (
            <div
              key={alert.id}
              className={`${styles.container} border rounded-lg p-4 flex items-start gap-3`}
            >
              <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`${styles.title} font-medium text-sm`}>
                  {alert.title}
                </h4>
                <p className={`${styles.message} text-sm mt-1`}>
                  {alert.message}
                </p>
              </div>
              {alert.dismissible && (
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className={`${styles.icon} hover:bg-black hover:bg-opacity-10 p-1 rounded flex-shrink-0`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}