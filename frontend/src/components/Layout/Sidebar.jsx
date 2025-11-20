import React from 'react';
import { motion } from 'framer-motion';
import { TrafficCone } from 'lucide-react';

const Sidebar = ({ navigation, activeView, setActiveView, trafficLevel }) => {
  const getStatusColor = () => {
    switch (trafficLevel) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (trafficLevel) {
      case 'critical':
        return 'Critique';
      case 'warning':
        return 'Modéré';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 flex flex-col shadow-2xl">
      {/* Logo et titre */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <TrafficCone className="w-7 h-7 text-white" />
            </div>
            <motion.div 
              className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor()} rounded-full ring-2 ring-slate-900`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Traffic Monitor</h1>
            <p className="text-xs text-slate-400">Surveillance en temps réel</p>
          </div>
        </div>

        {/* Indicateur de statut */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border ${
          trafficLevel === 'critical' ? 'border-red-500/30' :
          trafficLevel === 'warning' ? 'border-orange-500/30' :
          'border-green-500/30'
        }`}>
          <div className={`w-2 h-2 ${getStatusColor()} rounded-full`}></div>
          <span className="text-sm font-medium text-slate-300">
            Trafic {getStatusText()}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
              
              {item.badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-white text-blue-600' 
                    : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
          <p className="text-xs text-slate-400 mb-2">Besoin d'aide ?</p>
          <button className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Documentation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;