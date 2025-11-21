import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingUp, Clock, Download, BarChart3, PieChart as PieChartIcon, Activity,
  Database, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  fetchWeeklyData, 
  fetchHourlyDistribution,
  fetchHDFSStats 
} from '../../services/api';

const Analytics = ({ zones, stats }) => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('congestion');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [hdfsStats, setHdfsStats] = useState(null);

  const fallbackWeeklyData = [
    { day: 'Lun', congestion: 45, vehicles: 12000, incidents: 3 },
    { day: 'Mar', congestion: 52, vehicles: 13500, incidents: 5 },
    { day: 'Mer', congestion: 48, vehicles: 12800, incidents: 2 },
    { day: 'Jeu', congestion: 65, vehicles: 15200, incidents: 7 },
    { day: 'Ven', congestion: 72, vehicles: 16800, incidents: 8 },
    { day: 'Sam', congestion: 38, vehicles: 9500, incidents: 1 },
    { day: 'Dim', congestion: 32, vehicles: 8200, incidents: 1 },
  ];

  const fallbackHourlyData = [
    { hour: '00h', trafic: 15 },
    { hour: '03h', trafic: 8 },
    { hour: '06h', trafic: 35 },
    { hour: '09h', trafic: 85 },
    { hour: '12h', trafic: 65 },
    { hour: '15h', trafic: 55 },
    { hour: '18h', trafic: 90 },
    { hour: '21h', trafic: 45 },
  ];

  const getDaysFromTimeRange = (range) => {
    switch (range) {
      case '24h':
        return 1;
      case '7days':
        return 7;
      case '30days':
        return 30;
      case 'year':
        return 365;
      default:
        return 7;
    }
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case '24h':
        return 'dernières 24 heures';
      case '7days':
        return '7 derniers jours';
      case '30days':
        return '30 derniers jours';
      case 'year':
        return 'cette année';
      default:
        return '7 derniers jours';
    }
  };

  useEffect(() => {
    loadHDFSData();
  }, [timeRange]); 

  const loadHDFSData = async () => {
    setLoading(true);
    setError(null);

    try {
      const days = getDaysFromTimeRange(timeRange);
      
      console.log(`📊 Chargement données pour ${days} jours...`);
      
      
      const [weekly, hourly, stats] = await Promise.all([
        fetchWeeklyData(days),
        fetchHourlyDistribution(days),
        fetchHDFSStats()
      ]);

     
      if (weekly && weekly.length > 0) {
        const transformedWeekly = weekly.map(item => {
          const date = new Date(item.date);
          return {
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            date: item.date,
            congestion: Math.round(item.congestion),
            vehicles: Math.round(item.congestion * 200),
            incidents: Math.floor(Math.random() * 5) + 1,
            speed: item.speed
          };
        });
        setWeeklyData(transformedWeekly);
        console.log(`${transformedWeekly.length} jours de données chargés`);
      } else {
        console.log(' Pas de données HDFS, utilisation fallback');
        setWeeklyData(fallbackWeeklyData);
      }

      if (hourly && hourly.length > 0) {
        const transformedHourly = hourly.map(item => ({
          hour: item.hour,
          trafic: Math.round(item.congestion)
        }));
        setHourlyData(transformedHourly);
        console.log(` Distribution horaire chargée (${days} jours)`);
      } else {
        console.log(' Pas de données horaires HDFS, utilisation fallback');
        setHourlyData(fallbackHourlyData);
      }

      setHdfsStats(stats);

    } catch (err) {
      console.error(' Erreur chargement HDFS:', err);
      setError(err.message);
      setWeeklyData(fallbackWeeklyData);
      setHourlyData(fallbackHourlyData);
    } finally {
      setLoading(false);
    }
  };

  const zoneDistribution = zones.map(zone => ({
    name: zone.name.split(' ')[0],
    value: zone.vehicles || Math.round(zone.congestion * 10),
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  const performanceMetrics = [
    { metric: 'Fluidité', value: 100 - (stats.averageCongestion || 0), max: 100 },
    { metric: 'Sécurité', value: 85, max: 100 },
    { metric: 'Réactivité', value: 92, max: 100 },
    { metric: 'Couverture', value: 88, max: 100 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Analyses & Statistiques
          </h1>
          <p className="text-slate-600 mt-1">
            Vue détaillée des performances du trafic - {getTimeRangeLabel(timeRange)}
            {hdfsStats?.available && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <Database className="w-3 h-3 inline mr-1" />
                HDFS: {hdfsStats.total_records?.toLocaleString()} enregistrements
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Bouton refresh */}
          <button 
            onClick={loadHDFSData}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>

          {/* Filtre de période */}
          <select
            value={timeRange}
            onChange={(e) => {
              console.log(`📅 Changement période: ${e.target.value}`);
              setTimeRange(e.target.value);
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Dernières 24h</option>
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="year">Cette année</option>
          </select>
          
          {/* Bouton export */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Alerte erreur */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Données limitées</p>
            <p className="text-sm text-yellow-700">
              Impossible de charger les données HDFS. Affichage des données de démonstration.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Congestion Moyenne', 
            value: `${stats.averageCongestion || 0}%`, 
            change: '+12%', 
            trend: 'up',
            icon: TrendingUp,
            color: 'orange'
          },
          { 
            label: 'Véhicules Total', 
            value: zones.reduce((sum, z) => sum + (z.vehicles || 0), 0).toLocaleString(), 
            change: '+5%', 
            trend: 'up',
            icon: Activity,
            color: 'blue'
          },
          { 
            label: 'Zones Surveillées', 
            value: zones.length.toString(), 
            change: 'Stable', 
            trend: 'stable',
            icon: Database,
            color: 'green'
          },
          { 
            label: 'Période Analysée', 
            value: getDaysFromTimeRange(timeRange) === 1 ? '24h' : `${getDaysFromTimeRange(timeRange)}j`, 
            change: hdfsStats?.available ? 'Actif' : 'Inactif', 
            trend: hdfsStats?.available ? 'up' : 'down',
            icon: Clock,
            color: 'purple'
          },
        ].map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${kpi.color}-100`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                kpi.trend === 'up' ? 'bg-red-100 text-red-700' : 
                kpi.trend === 'down' ? 'bg-green-100 text-green-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {kpi.value}
            </div>
            <div className="text-sm text-slate-600">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-blue-700">
            Chargement des données pour {getTimeRangeLabel(timeRange)}...
          </p>
        </div>
      )}

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution hebdomadaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Évolution Temporelle
            </h3>
            <div className="flex items-center gap-2">
              {hdfsStats?.available && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  HDFS
                </span>
              )}
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                {weeklyData.length} points
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCongestion)"
                name="Congestion (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution horaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Distribution Horaire
            </h3>
            <div className="flex items-center gap-2">
              {hdfsStats?.available && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  HDFS
                </span>
              )}
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                Moyenne {getDaysFromTimeRange(timeRange)}j
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="trafic" name="Trafic (%)" radius={[8, 8, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.trafic > 70 ? '#ef4444' : entry.trafic > 40 ? '#f59e0b' : '#22c55e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition par zone */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-pink-600" />
            Répartition par Zone
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={zoneDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance radar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Système</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={performanceMetrics}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b' }} />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top statistiques */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Top Zones</h3>
          <div className="space-y-4">
            {zones
              .sort((a, b) => b.congestion - a.congestion)
              .slice(0, 4)
              .map((zone, index) => (
                <div key={zone.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-red-100 text-red-600' :
                    index === 1 ? 'bg-orange-100 text-orange-600' :
                    index === 2 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{zone.name}</div>
                    <div className="text-xs text-slate-500">{zone.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{zone.congestion}%</div>
                    <div className="text-xs text-slate-500">{zone.vehicles || 'N/A'}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tableau de données */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Données Détaillées</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">Zone</th>
                <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">Localisation</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Congestion</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Vitesse</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Tendance</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone, index) => (
                <tr 
                  key={zone.id} 
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-slate-900">{zone.name}</td>
                  <td className="py-4 px-4 text-slate-600">{zone.location}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold ${
                      zone.congestion > 70 ? 'text-red-600' :
                      zone.congestion > 40 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {zone.congestion}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700">
                    {zone.current_speed ? `${Math.round(zone.current_speed)} km/h` : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      zone.trend === 'up' ? 'text-red-600' :
                      zone.trend === 'down' ? 'text-green-600' :
                      'text-slate-600'
                    }`}>
                      {zone.trend === 'up' ? '↑' : zone.trend === 'down' ? '↓' : '→'}
                      {zone.trend === 'up' ? 'Hausse' : zone.trend === 'down' ? 'Baisse' : 'Stable'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      zone.congestion > 70 ? 'bg-red-100 text-red-700' :
                      zone.congestion > 40 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {zone.congestion > 70 ? 'Critique' : zone.congestion > 40 ? 'Modéré' : 'Fluide'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;