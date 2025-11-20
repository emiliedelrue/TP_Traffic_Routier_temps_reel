import React from 'react';
import { Car, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsGrid = ({ stats }) => {
  const cards = [
    {
      title: 'Zones surveillées',
      value: stats.totalZones,
      icon: Car,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100/50',
      change: '+2%',
      changeType: 'positive',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Congestion moyenne',
      value: `${stats.averageCongestion}%`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100/50',
      change: '+12%',
      changeType: 'negative',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Alertes actives',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100/50',
      change: `+${stats.activeAlerts}`,
      changeType: 'negative',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Heures de pointe',
      value: stats.peakHours,
      icon: Clock,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100/50',
      change: 'Maintenant',
      changeType: 'neutral',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      }
    },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{ 
            y: -8, 
            transition: { type: "spring", stiffness: 300 } 
          }}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl shadow-lg border border-slate-200/50 p-6 group cursor-pointer`}
        >
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <div className="relative">
            {/* En-tête avec icône et badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${card.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
              
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                card.changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : card.changeType === 'negative'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {card.change}
              </span>
            </div>

            {/* Valeur principale */}
            <div className="mb-2">
              <div className="text-4xl font-black text-slate-900 mb-1 group-hover:scale-105 transition-transform">
                {card.value}
              </div>
              <div className="text-sm font-medium text-slate-600">
                {card.title}
              </div>
            </div>

            {/* Barre de progression décorative */}
            <div className="mt-4 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsGrid;