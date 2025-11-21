import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, AlertCircle, Info, Search, Filter,
  Clock, MapPin, X, Check, Archive, Bell, TrendingUp
} from 'lucide-react';

const Alerts = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const extendedAlerts = [
    ...initialAlerts,
    {
      id: 4,
      type: 'warning',
      title: 'Ralentissement important',
      location: 'A1 - Sortie 18',
      time: 'Il y a 15 min',
      duration: '45 min estimées',
      status: 'active',
      priority: 'medium',
      affectedVehicles: 250
    },
    {
      id: 5,
      type: 'info',
      title: 'Maintenance programmée',
      location: 'Périphérique Ouest',
      time: 'Demain à 02:00',
      duration: '4 heures',
      status: 'scheduled',
      priority: 'low',
      affectedVehicles: 50
    },
    {
      id: 6,
      type: 'critical',
      title: 'Conditions météo dangereuses',
      location: 'A6 - Zone Nord',
      time: 'Il y a 2 min',
      duration: '2 heures estimées',
      status: 'active',
      priority: 'high',
      affectedVehicles: 500
    },
  ];

  const [alertsList, setAlertsList] = useState(extendedAlerts);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          badgeBg: 'bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-900',
          badgeBg: 'bg-orange-600',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          badgeBg: 'bg-blue-600',
        };
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-orange-100 text-orange-700 border-orange-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return styles[priority] || styles.low;
  };

  const filteredAlerts = alertsList
    .filter(alert => {
      if (filterType !== 'all' && alert.type !== filterType) return false;
      if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alert.location.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const handleDismiss = (alertId) => {
    setAlertsList(alertsList.filter(alert => alert.id !== alertId));
  };

  const handleResolve = (alertId) => {
    setAlertsList(alertsList.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const stats = {
    total: alertsList.length,
    critical: alertsList.filter(a => a.type === 'critical').length,
    warning: alertsList.filter(a => a.type === 'warning').length,
    info: alertsList.filter(a => a.type === 'info').length,
    active: alertsList.filter(a => a.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Alertes
          </h1>
          <p className="text-slate-600 mt-1">Surveillance et gestion des incidents en temps réel</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archivées
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border-2 border-red-200 p-4">
          <div className="text-2xl font-black text-red-600">{stats.critical}</div>
          <div className="text-sm text-red-700 font-medium">Critiques</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border-2 border-orange-200 p-4">
          <div className="text-2xl font-black text-orange-600">{stats.warning}</div>
          <div className="text-sm text-orange-700 font-medium">Warnings</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 p-4">
          <div className="text-2xl font-black text-blue-600">{stats.info}</div>
          <div className="text-sm text-blue-700 font-medium">Info</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-green-200 p-4">
          <div className="text-2xl font-black text-green-600">{stats.active}</div>
          <div className="text-sm text-green-700 font-medium">Actives</div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une alerte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <div className="flex gap-2">
            {['all', 'critical', 'warning', 'info'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' && 'Toutes'}
                {type === 'critical' && 'Critiques'}
                {type === 'warning' && 'Warnings'}
                {type === 'info' && 'Info'}
              </button>
            ))}
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Plus récentes</option>
            <option value="priority">Par priorité</option>
          </select>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type);
            const style = getAlertStyle(alert.type);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`${style.bg} ${style.border} border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex gap-4">
                  {/* Icône et barre latérale */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`${style.iconBg} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${style.iconColor}`} />
                    </div>
                    {alert.type === 'critical' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                    )}
                  </div>

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-bold text-lg ${style.textColor}`}>
                            {alert.title}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityBadge(alert.priority)}`}>
                            {alert.priority === 'high' && 'Haute priorité'}
                            {alert.priority === 'medium' && 'Priorité moyenne'}
                            {alert.priority === 'low' && 'Basse priorité'}
                          </span>
                          {alert.status === 'resolved' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border-2 border-green-300">
                              ✓ Résolue
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{alert.time}</span>
                          </div>
                          {alert.affectedVehicles && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{alert.affectedVehicles} véhicules</span>
                            </div>
                          )}
                        </div>

                        {alert.duration && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${style.iconBg} text-sm font-medium`}>
                            <Clock className="w-4 h-4" />
                            Durée: {alert.duration}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                            title="Marquer comme résolue"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Ignorer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Barre de progression pour alertes critiques */}
                    {alert.type === 'critical' && alert.status === 'active' && (
                      <div className="mt-4">
                        <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune alerte</h3>
            <p className="text-slate-600">
              {searchTerm || filterType !== 'all' 
                ? 'Aucune alerte ne correspond à vos critères de recherche.'
                : 'Tout fonctionne normalement. Il n\'y a aucune alerte active.'}
            </p>
          </div>
        )}
      </div>

      {/* Timeline des alertes récentes */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Chronologie
        </h3>
        <div className="space-y-4">
          {alertsList.slice(0, 5).map((alert, index) => (
            <div key={alert.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}></div>
                {index < alertsList.slice(0, 5).length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="font-semibold text-slate-900">{alert.title}</div>
                <div className="text-sm text-slate-600">{alert.location}</div>
                <div className="text-xs text-slate-500 mt-1">{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;