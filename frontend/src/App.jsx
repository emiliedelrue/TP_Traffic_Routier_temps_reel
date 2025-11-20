import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Bell,
  Settings,
  AlertCircle,
} from 'lucide-react';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import Analytics from './components/Analytics/Analytics';
import Alerts from './components/Alerts/Alerts';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import { 
  fetchLiveZones, 
  fetchAggregateStats,
  transformZoneData,
  transformAggregateStats
} from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trafficData, setTrafficData] = useState({
    zones: [],
    stats: {
      averageCongestion: 0,
      activeAlerts: 0,
      totalZones: 0,
      peakHours: '08:00-10:00',
      totalVehicles: 0,
      fluide: 0,
      modere: 0,
      dense: 0,
      bloque: 0,
      alerts: [],
    },
  });

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Tableau de Bord', 
      icon: LayoutDashboard, 
      color: 'blue', 
      description: 'Vue d\'ensemble du trafic' 
    },
    { 
      id: 'map', 
      label: 'Carte Live', 
      icon: MapIcon, 
      color: 'green', 
      description: 'Visualisation géographique' 
    },
    { 
      id: 'analytics', 
      label: 'Analyses', 
      icon: BarChart3, 
      color: 'purple', 
      description: 'Statistiques détaillées' 
    },
    { 
      id: 'alerts', 
      label: 'Alertes', 
      icon: Bell, 
      color: 'red', 
      badge: trafficData.stats.activeAlerts, 
      description: 'Notifications critiques' 
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings, 
      color: 'gray', 
      description: 'Configuration du système' 
    },
  ];

  // Charger les données depuis l'API
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer les zones et les stats en parallèle
      const [zonesData, statsData] = await Promise.all([
        fetchLiveZones(),
        fetchAggregateStats()
      ]);

      // Transformer les données
      const transformedZones = zonesData.map(transformZoneData);
      const transformedStats = transformAggregateStats(statsData);

      // Mettre à jour l'état
      setTrafficData({
        zones: transformedZones,
        stats: {
          ...transformedStats,
          alerts: [], // À implémenter si vous avez des alertes
        },
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et toutes les 10 secondes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    // Afficher l'erreur si présente
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Erreur de connexion</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
          <p className="text-sm text-red-600 mt-4">
            Vérifiez que le backend est lancé sur http://localhost:8000
          </p>
        </div>
      );
    }

    // Afficher un message si pas de données
    if (!loading && trafficData.zones.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Aucune donnée disponible</h2>
          <p className="text-yellow-700 mb-4">
            En attente des données du système de streaming...
          </p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      );
    }

    // Afficher le contenu selon l'onglet actif
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            zones={trafficData.zones}
            stats={trafficData.stats}
            alerts={trafficData.stats.alerts}
          />
        );
      
      case 'map':
        return (
          <MapView zones={trafficData.zones} />
        );
      
      case 'analytics':
        return (
          <Analytics 
            zones={trafficData.zones}
            stats={trafficData.stats}
          />
        );
      
      case 'alerts':
        return (
          <Alerts alerts={trafficData.stats.alerts} />
        );
      
      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Paramètres
              </h2>
              <p className="text-slate-600 mt-2">Configuration de l'application</p>
            </div>
            <div className="h-[600px] bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
              <div className="text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold mb-2">Panneau de configuration</p>
                <p className="text-sm">Options de personnalisation à venir</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex">
      <Sidebar
        navigation={tabs}
        activeView={activeTab}
        setActiveView={setActiveTab}
        trafficLevel={
          trafficData.stats.averageCongestion > 70 
            ? 'critical' 
            : trafficData.stats.averageCongestion > 40 
            ? 'warning' 
            : 'normal'
        }
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar
          lastUpdate={lastUpdate}
          onRefresh={loadData}
          loading={loading}
          trafficLevel={
            trafficData.stats.averageCongestion > 70 
              ? 'critical' 
              : trafficData.stats.averageCongestion > 40 
              ? 'warning' 
              : 'normal'
          }
        />
        
        <main className="flex-1 p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;