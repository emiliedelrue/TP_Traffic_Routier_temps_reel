import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Bell,
  Search,
  Settings,
  TrafficCone,
  Car,
  AlertTriangle,
  Clock,
  TrendingUp,
  Wifi,
  RefreshCw,
  Users,
  MapPin,
} from 'lucide-react';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';

function App() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trafficData, setTrafficData] = useState({
    zones: [
      { id: 1, name: 'Périphérique Est', location: 'Paris', congestion: 85, trend: 'up', vehicles: 1240, status: 'critical' },
      { id: 2, name: 'A6 Sud', location: 'Lyon', congestion: 45, trend: 'down', vehicles: 680, status: 'normal' },
      { id: 3, name: 'Rocade Ouest', location: 'Bordeaux', congestion: 72, trend: 'up', vehicles: 950, status: 'warning' },
      { id: 4, name: 'A7 Nord', location: 'Marseille', congestion: 38, trend: 'stable', vehicles: 520, status: 'normal' },
    ],
    stats: {
      averageCongestion: 60,
      activeAlerts: 3,
      totalZones: 12,
      peakHours: '08:00-10:00',
      totalVehicles: 15200,
      alerts: [
        { id: 1, type: 'critical', title: 'Accident majeur', location: 'Périphérique Est - Porte de Bagnolet', time: 'Il y a 5 min', duration: '30 min estimées' },
        { id: 2, type: 'warning', title: 'Travaux routiers', location: 'A6 - Sortie 12', time: 'Depuis 08:00', duration: 'Jusqu\'à 18:00' },
        { id: 3, type: 'info', title: 'Événement sportif', location: 'Stade de France - Accès', time: 'À partir de 19:00', duration: '3 heures' },
      ],
    },
  });

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, color: 'blue', description: 'Vue d\'ensemble du trafic' },
    { id: 'map', label: 'Carte Live', icon: MapIcon, color: 'green', description: 'Visualisation géographique' },
    { id: 'analytics', label: 'Analyses', icon: BarChart3, color: 'purple', description: 'Statistiques détaillées' },
    { id: 'alerts', label: 'Alertes', icon: Bell, color: 'red', badge: 3, description: 'Notifications critiques' },
    { id: 'settings', label: 'Paramètres', icon: Settings, color: 'gray', description: 'Configuration du système' },
  ];

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (congestion) => {
    if (congestion > 70) return 'text-red-500';
    if (congestion > 40) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusBgColor = (congestion) => {
    if (congestion > 70) return 'bg-red-50 border-red-200';
    if (congestion > 40) return 'bg-orange-50 border-orange-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusText = (congestion) => {
    if (congestion > 70) return 'Congestionné';
    if (congestion > 40) return 'Modéré';
    return 'Fluide';
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        navigation={tabs}
        activeView={activeTab}
        setActiveView={setActiveTab}
        trafficLevel={trafficData.stats.averageCongestion > 70 ? 'critical' : trafficData.stats.averageCongestion > 40 ? 'warning' : 'normal'}
      />
      <div className="flex-1 flex flex-col">
        <TopBar
          lastUpdate={lastUpdate}
          onRefresh={loadData}
          loading={loading}
          trafficLevel={trafficData.stats.averageCongestion > 70 ? 'critical' : trafficData.stats.averageCongestion > 40 ? 'warning' : 'normal'}
        />
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  zones={trafficData.zones}
                  stats={trafficData.stats}
                  alerts={trafficData.stats.alerts}
                />
              </motion.div>
            )}
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Carte du trafic en temps réel</h2>
                <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                  <p>Intégration de la carte interactive ici (Leaflet/Google Maps)</p>
                </div>
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Analyses et statistiques détaillées</h2>
                <div className="text-slate-600">
                  <p>Graphiques et analyses avancées ici.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
