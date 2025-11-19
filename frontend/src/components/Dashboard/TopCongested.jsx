import React from 'react';

const TopCongested = ({ zones }) => {
  const getColorClass = (congestion) => {
    if (congestion < 20) return 'bg-green-500';
    if (congestion < 50) return 'bg-yellow-500';
    if (congestion < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔴 Top 5 Zones Congestionnées</h2>
      <div className="space-y-3">
        {zones.map((zone, index) => (
          <div key={zone.zone_id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{zone.zone_name}</p>
              <p className="text-sm text-gray-500">{zone.current_speed.toFixed(1)} km/h</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(zone.congestion_level)} transition-all duration-500`}
                  style={{ width: `${zone.congestion_level}%` }}
                ></div>
              </div>
              <span className="font-bold text-gray-700 w-12 text-right">
                {zone.congestion_level.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCongested;