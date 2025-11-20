import React from 'react';
import { Gauge, TrendingUp, Map, Activity } from 'lucide-react';

const KPICards = ({ stats }) => {
  const kpiData = [
    {
      title: 'Vitesse Moyenne',
      value: stats.avg_speed ? `${Math.round(stats.avg_speed)}` : '0',
      unit: 'km/h',
      icon: Gauge,
      color: 'blue',
      trend: '+2.5%',
      trendUp: true,
    },
    {
      title: 'Congestion',
      value: stats.avg_congestion ? `${Math.round(stats.avg_congestion)}` : '0',
      unit: '%',
      icon: TrendingUp,
      color: 'orange',
      trend: '-3.2%',
      trendUp: false,
    },
    {
      title: 'Zones Actives',
      value: stats.total_zones || '0',
      unit: 'zones',
      icon: Map,
      color: 'purple',
      subtitle: 'En surveillance',
    },
    {
      title: 'Trafic Fluide',
      value: stats.fluide_percent ? `${Math.round(stats.fluide_percent)}` : '0',
      unit: '%',
      icon: Activity,
      color: 'green',
      subtitle: `${stats.fluide || 0} zones`,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        icon: 'bg-blue-500',
        text: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      orange: {
        icon: 'bg-orange-500',
        text: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      purple: {
        icon: 'bg-purple-500',
        text: 'text-purple-600',
        bg: 'bg-purple-50',
      },
      green: {
        icon: 'bg-green-500',
        text: 'text-green-600',
        bg: 'bg-green-50',
      },
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        const colors = getColorClasses(kpi.color);

        return (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${colors.icon}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {kpi.trend && (
                <span className={`text-xs font-medium ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                {kpi.title}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">
                  {kpi.value}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {kpi.unit}
                </span>
              </div>
              {kpi.subtitle && (
                <p className="text-xs text-slate-400 mt-1">
                  {kpi.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;