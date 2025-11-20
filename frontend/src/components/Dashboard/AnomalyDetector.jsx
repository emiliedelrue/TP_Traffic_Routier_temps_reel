import React, { useMemo } from 'react';
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle } from 'lucide-react';

const AnomalyDetector = ({ zones }) => {
  const anomalies = useMemo(() => {
    if (!zones || zones.length === 0) return [];

    const detected = [];

    zones.forEach((zone) => {
      if (zone.current_speed < 10 && zone.free_flow_speed > 80) {
        detected.push({
          severity: 'critical',
          type: 'Incident',
          zone: zone.zone_name || `Zone ${zone.zone_id}`,
          desc: `${Math.round(zone.current_speed)} km/h`,
          icon: AlertOctagon,
        });
      }

      if (zone.congestion_level > 80) {
        detected.push({
          severity: 'high',
          type: 'Congestion',
          zone: zone.zone_name || `Zone ${zone.zone_id}`,
          desc: `${Math.round(zone.congestion_level)}%`,
          icon: AlertTriangle,
        });
      }

      if (zone.current_speed < zone.free_flow_speed * 0.4) {
        detected.push({
          severity: 'medium',
          type: 'Ralentissement',
          zone: zone.zone_name || `Zone ${zone.zone_id}`,
          desc: `-${Math.round(100 - (zone.current_speed / zone.free_flow_speed) * 100)}%`,
          icon: AlertCircle,
        });
      }
    });

    return detected;
  }, [zones]);

  const getSeverityStyle = (severity) => {
    const styles = {
      critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-500',
      },
      high: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-500',
      },
      medium: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        badge: 'bg-yellow-500',
      },
    };
    return styles[severity];
  };

  return (
    <div>
      {anomalies.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {anomalies.map((anomaly, index) => {
            const style = getSeverityStyle(anomaly.severity);
            const Icon = anomaly.icon;

            return (
              <div
                key={index}
                className={`${style.bg} border ${style.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${style.badge} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold text-sm ${style.text}`}>
                        {anomaly.type}
                      </h4>
                      <span className={`${style.badge} text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold`}>
                        {anomaly.severity}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 mb-1">
                      {anomaly.zone}
                    </p>

                    <p className="text-xs text-slate-500">
                      {anomaly.desc}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">
            Aucune anomalie
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Toutes les zones sont dans les limites normales
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Surveillance active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetector;