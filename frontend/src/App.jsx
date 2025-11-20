import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import Analytics from './components/Analytics/Analytics';
import Alerts from './components/Alerts/Alerts';
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
      { id: 5, name: 'A1 Nord', location: 'Toulouse', congestion: 55, trend: 'up', vehicles: 820, status: 'warning' },
      { id: 6, name: 'A8 Est', location: 'Nice', congestion: 42, trend: 'down', vehicles: 590, status: 'normal' },
    ],
    stats: {
      averageCongestion: 60,
      activeAlerts: 3,
      totalZones: 12,
      peakHours: '08:00-10:00',
      totalVehicles: 15200,
      alerts: [
        { 
          id: 1, 
          type: 'critical', 
          title: 'Accident majeur', 
          location: 'Périphérique Est - Porte de Bagnolet', 
          time: 'Il y a 5 min', 
          duration: '30 min estimées',
          status: 'active',
          priority: 'high',
          affectedVehicles: 350
        },
        { 
          id: 2, 
          type: 'warning', 
          title: 'Travaux routiers', 
          location: 'A6 - Sortie 12', 
          time: 'Depuis 08:00', 
          duration: 'Jusqu\'à 18:00',
          status: 'active',
          priority: 'medium',
          affectedVehicles: 180
        },
        { 
          id: 3, 
          type: 'info', 
          title: 'Événement sportif', 
          location: 'Stade de France - Accès', 
          time: 'À partir de 19:00', 
          duration: '3 heures',
          status: 'scheduled',
          priority: 'low',
          affectedVehicles: 200
        },
      ],
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

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Simuler un chargement de données
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  const renderContent = () => {
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