import React, { useState, useEffect } from 'react';

const CongestionHeatmap = ({ zones }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    // Génération de données mockées pour la heatmap
    // Dans un vrai projet, ces données viendraient de l'API
    const data = daysOfWeek.map((day) => ({
      day,
      hours: hours.map((hour) => {
        // Simulation de patterns réalistes de trafic
        let congestion = 20;
        
        // Heures de pointe du matin (7h-9h)
        if (hour >= 7 && hour <= 9) {
          congestion = 70 + Math.random() * 20;
        }
        // Heures de pointe du soir (17h-19h)
        else if (hour >= 17 && hour <= 19) {
          congestion = 75 + Math.random() * 20;
        }
        // Midi (12h-14h)
        else if (hour >= 12 && hour <= 14) {
          congestion = 45 + Math.random() * 15;
        }
        // Nuit (22h-6h)
        else if (hour >= 22 || hour <= 6) {
          congestion = 5 + Math.random() * 15;
        }
        // Reste de la journée
        else {
          congestion = 25 + Math.random() * 20;
        }

        // Week-end : moins de trafic
        if (day === 'Sam' || day === 'Dim') {
          congestion *= 0.6;
        }

        return Math.round(congestion);
      }),
    }));
    
    setHeatmapData(data);
  }, [zones]);

  const getColorForValue = (value) => {
    if (value < 20) return 'bg-green-500';
    if (value < 40) return 'bg-yellow-500';
    if (value < 60) return 'bg-orange-500';
    if (value < 80) return 'bg-red-500';
    return 'bg-red-700';
  };

  const getOpacity = (value) => {
    return Math.min(0.3 + (value / 100) * 0.7, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🔥 Heatmap de Congestion (7 derniers jours)
      </h2>
      
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="font-medium text-gray-600">Légende :</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Fluide</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Modéré</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Dense</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Bloqué</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header avec les heures */}
          <div className="flex mb-2">
            <div className="w-16"></div>
            <div className="flex-1 flex justify-between text-xs text-gray-500 font-medium">
              {hours.map((hour) => (
                <div key={hour} className="w-8 text-center">
                  {hour}h
                </div>
              ))}
            </div>
          </div>

          {/* Lignes avec les jours */}
          {heatmapData.map((dayData) => (
            <div key={dayData.day} className="flex items-center mb-1">
              <div className="w-16 text-sm font-medium text-gray-600">
                {dayData.day}
              </div>
              <div className="flex-1 flex gap-1">
                {dayData.hours.map((value, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`w-8 h-8 rounded ${getColorForValue(value)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all group relative`}
                    style={{ opacity: getOpacity(value) }}
                    title={`${dayData.day} ${hourIndex}h: ${value}%`}
                  >
                    {/* Tooltip au survol */}
                    <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                      {value}%
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Insight :</span> Les heures de pointe sont généralement entre 7h-9h et 17h-19h en semaine.
          Le trafic est plus fluide le week-end.
        </p>
      </div>
    </div>
  );
};

export default CongestionHeatmap;
