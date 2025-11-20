import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TrafficMap = ({ zones, onZoneClick }) => {
  const center = [48.8566, 2.3522]; // Paris

  const getColor = (congestion) => {
    if (congestion < 20) return '#22c55e'; // green
    if (congestion < 50) return '#eab308'; // yellow
    if (congestion < 80) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getStatusColor = (status) => {
    const colors = {
      'Fluide': 'text-green-600',
      'Modéré': 'text-yellow-600',
      'Dense': 'text-orange-600',
      'Bloqué': 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const handleZoneClick = (zoneId) => {
    if (onZoneClick) {
      onZoneClick(zoneId);
    }
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {zones.map((zone) => (
          <CircleMarker
            key={zone.zone_id}
            center={[zone.latitude, zone.longitude]}
            radius={15}
            fillColor={getColor(zone.congestion_level)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => handleZoneClick(zone.zone_id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{zone.zone_name}</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Vitesse:</span> 
                    <span className="ml-2 font-semibold">{zone.current_speed.toFixed(1)} km/h</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Vitesse libre:</span> 
                    <span className="ml-2">{zone.free_flow_speed.toFixed(0)} km/h</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Congestion:</span> 
                    <span className="ml-2 font-semibold">{zone.congestion_level.toFixed(0)}%</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Statut:</span> 
                    <span className={`ml-2 font-semibold ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </span>
                  </p>
                  <button 
                    onClick={() => handleZoneClick(zone.zone_id)}
                    className="mt-2 w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    Voir l'historique
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrafficMap;