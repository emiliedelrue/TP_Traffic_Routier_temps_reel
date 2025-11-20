import React from 'react';
import { AlertCircle } from 'lucide-react';

const TopCongested = ({ zones }) => {
  const getStatusColor = (congestion) => {
    if (congestion >= 80) return 'bg-red-500';
    if (congestion >= 50) return 'bg-orange-500';
    if (congestion >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBg = (congestion) => {
    if (congestion >= 80) return 'bg-red-50';
    if (congestion >= 50) return 'bg-orange-50';
    if (congestion >= 20) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-slate-900 text-sm">
            Top 5 Congestion
          </h2>
        </div>
      </div>

      <div className="p-4">
        {zones && zones.length > 0 ? (
          <div className="space-y-3">
            {zones.map((zone, index) => (
              <div
                key={zone.zone_id}
                className={`${getStatusBg(zone.congestion_level)} rounded-lg p-3 border border-slate-200`}
              >
                <div className="flex items-center gap-3">
                  {/* Position Badge */}
                  <div className="flex-shrink-0 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {zone.zone_name || `Zone ${zone.zone_id}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {Math.round(zone.current_speed)} km/h
                    </p>
                  </div>

                  {/* Congestion */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {Math.round(zone.congestion_level)}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(zone.congestion_level)} transition-all duration-500`}
                    style={{ width: `${Math.min(zone.congestion_level, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aucune donnée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCongested;