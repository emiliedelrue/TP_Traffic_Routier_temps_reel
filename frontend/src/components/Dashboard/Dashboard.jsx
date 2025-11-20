import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsGrid from './StatsGrid';
import AlertPanel from './AlertPanel';
import { Car, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = ({ zones, stats, alerts }) => {
  const dashboardStats = {
    totalZones: zones.length,
    averageCongestion: stats.averageCongestion,
    activeAlerts: stats.activeAlerts,
    peakHours: stats.peakHours,
  };

  // Données pour le graphique en aire
  const chartData = zones.map(zone => ({
    name: zone.name.split(' ')[0], // Raccourcir les noms
    congestion: zone.congestion,
    vehicles: zone.vehicles,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].payload.name}</p>
          <p className="text-sm text-slate-600">
            Congestion: <span className="font-bold text-blue-600">{payload[0].value}%</span>
          </p>
          <p className="text-sm text-slate-600">
            Véhicules: <span className="font-bold text-purple-600">{payload[0].payload.vehicles}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Tableau de Bord
          </h1>
          <p className="text-slate-600 mt-1">Surveillance du trafic en temps réel</p>
        </div>
      </div>

      <StatsGrid stats={dashboardStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique principal */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-slate-200/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Évolution du Trafic</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <span className="text-slate-600">Congestion</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCongestion)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Panel d'alertes */}
        <div className="bg-gradient-to-br from-white to-red-50/20 rounded-2xl shadow-lg border border-slate-200/50 p-6 backdrop-blur-sm">
          <AlertPanel alerts={alerts} />
        </div>
      </div>

      {/* Liste des zones */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Zones de trafic surveillées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                zone.congestion > 70 
                  ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:border-red-300' 
                  : zone.congestion > 40 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-300'
                  : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:border-green-300'
              }`}
            >
              {/* Bande de couleur sur le côté */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                zone.congestion > 70 ? 'bg-gradient-to-b from-red-500 to-red-600' :
                zone.congestion > 40 ? 'bg-gradient-to-b from-orange-500 to-orange-600' :
                'bg-gradient-to-b from-green-500 to-green-600'
              }`}></div>

              <div className="p-5 pl-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {zone.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{zone.location}</span>
                    </div>
                  </div>
                  
                  {/* Badge de congestion */}
                  <div className={`flex flex-col items-end gap-1`}>
                    <div className={`text-3xl font-black ${
                      zone.congestion > 70 ? 'text-red-600' :
                      zone.congestion > 40 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {zone.congestion}%
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      zone.congestion > 70 ? 'bg-red-200 text-red-800' :
                      zone.congestion > 40 ? 'bg-orange-200 text-orange-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {getStatusText(zone.congestion)}
                    </span>
                  </div>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700">{zone.vehicles}</span>
                    <span className="text-slate-500">véhicules</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    zone.trend === 'up' ? 'text-red-600' : 
                    zone.trend === 'down' ? 'text-green-600' : 
                    'text-slate-600'
                  }`}>
                    {zone.trend === 'up' ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>En hausse</span>
                      </>
                    ) : zone.trend === 'down' ? (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        <span>En baisse</span>
                      </>
                    ) : (
                      <span>Stable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getStatusText = (congestion) => {
  if (congestion > 70) return 'Congestionné';
  if (congestion > 40) return 'Modéré';
  return 'Fluide';
};

export default Dashboard;