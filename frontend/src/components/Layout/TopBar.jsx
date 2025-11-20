import React from 'react';
import { RefreshCw, Bell, Search, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TopBar = ({ lastUpdate, onRefresh, loading, trafficLevel }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusStyle = () => {
    switch (trafficLevel) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Barre de recherche */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une zone, une rue..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions et statut */}
          <div className="flex items-center gap-3 ml-6">
            {/* Statut et dernière mise à jour */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  trafficLevel === 'critical' ? 'bg-red-500 animate-pulse' :
                  trafficLevel === 'warning' ? 'bg-orange-500 animate-pulse' :
                  'bg-green-500'
                }`}></div>
                <span className="text-xs font-medium text-slate-600">
                  Mis à jour : {formatTime(lastUpdate)}
                </span>
              </div>
            </div>

            {/* Bouton refresh */}
            <motion.button
              onClick={onRefresh}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-xl border transition-all ${
                loading 
                  ? 'bg-slate-100 border-slate-200 cursor-not-allowed' 
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </motion.button>

            {/* Paramètres */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </motion.button>

            {/* Profil utilisateur */}
            <div className="flex items-center gap-3 pl-3 ml-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">Admin</div>
                <div className="text-xs text-slate-500">Superviseur</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;