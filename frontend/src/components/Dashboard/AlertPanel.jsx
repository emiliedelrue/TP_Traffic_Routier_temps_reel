import React from 'react';
import { AlertTriangle, Clock, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertPanel = ({ alerts }) => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Alertes actives
        </h3>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {alerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type);
            const style = getAlertStyle(alert.type);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`${style.bg} ${style.border} border-2 rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex gap-3">
                  {/* Icône */}
                  <div className={`${style.iconBg} p-2 rounded-lg h-fit group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold ${style.textColor} mb-1 truncate`}>
                      {alert.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {alert.location}
                    </p>
                    
                    {/* Informations temporelles */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
                      </div>
                      {alert.duration && (
                        <span className={`${style.badgeBg} text-white px-2 py-0.5 rounded-full font-medium`}>
                          {alert.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barre de pulsation pour les alertes critiques */}
                {alert.type === 'critical' && (
                  <motion.div 
                    className="mt-3 h-1 bg-red-200 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
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
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
            <Info className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-slate-600 font-medium">Aucune alerte active</p>
          <p className="text-sm text-slate-500 mt-1">Tout fonctionne normalement</p>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;