import React from 'react';

const KPICard = ({ title, value, subtitle, icon, color, trend }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} transform transition hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

const KPICards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Vitesse Moyenne"
        value={`${stats.avg_global_speed.toFixed(1)} km/h`}
        subtitle="Globale"
        icon="🚗"
        color="border-blue-500"
      />
      
      <KPICard
        title="Congestion"
        value={`${stats.avg_global_congestion.toFixed(0)}%`}
        subtitle={
          stats.avg_global_congestion < 20 ? "Fluide" :
          stats.avg_global_congestion < 50 ? "Modéré" :
          stats.avg_global_congestion < 80 ? "Dense" : "Bloqué"
        }
        icon="📊"
        color="border-orange-500"
      />
      
      <KPICard
        title="Zones Surveillées"
        value={stats.total_zones}
        subtitle={`${stats.bloque} zone(s) bloquée(s)`}
        icon="📍"
        color="border-green-500"
      />
      
      <KPICard
        title="Zones Fluides"
        value={`${stats.fluide}/${stats.total_zones}`}
        subtitle={`${((stats.fluide / stats.total_zones) * 100).toFixed(0)}% du réseau`}
        icon="✅"
        color="border-purple-500"
      />
    </div>
  );
};

export default KPICards;