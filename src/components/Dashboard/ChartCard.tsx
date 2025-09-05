interface ChartCardProps {
  title: string;
  data: Record<string, number>;
  type: 'bar' | 'doughnut';
}

export function ChartCard({ title, data, type }: ChartCardProps) {
  const entries = Object.entries(data);
  const maxValue = Math.max(...entries.map(([, value]) => value));

  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-orange-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-yellow-500'
  ];

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {entries.map(([category, value], index) => (
            <div key={category} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 capitalize">{category}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
                <div 
                  className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-sm font-medium text-gray-900">{value}</div>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </div>
    );
  }

  // Doughnut chart (simplified as a list with colored indicators)
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map(([priority, value], index) => {
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="text-sm text-gray-600 capitalize">{priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{value}</span>
                <span className="text-xs text-gray-500">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado disponível
        </div>
      )}
    </div>
  );
}