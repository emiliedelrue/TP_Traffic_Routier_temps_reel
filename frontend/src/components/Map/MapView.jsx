import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Info, TrendingUp, Car } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ zones }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapType, setMapType] = useState('streets');

  // Vérifier que les zones ont des coordonnées valides
  const validZones = zones.filter(zone => 
    zone.coordinates && 
    zone.coordinates.length === 2 &&
    !isNaN(zone.coordinates[0]) &&
    !isNaN(zone.coordinates[1])
  );

  // Couleur selon le niveau de congestion
  const getMarkerColor = (congestion) => {
    if (congestion > 70) return '#ef4444'; // Rouge
    if (congestion > 40) return '#f59e0b'; // Orange
    return '#22c55e'; // Vert
  };

  // Créer une icône personnalisée
  const createCustomIcon = (congestion) => {
    const color = getMarkerColor(congestion);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  const mapStyles = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  // Calculer le centre de la carte basé sur les zones
  const getMapCenter = () => {
    if (validZones.length === 0) return [48.8566, 2.3522]; // Paris par défaut
    
    const avgLat = validZones.reduce((sum, zone) => sum + zone.coordinates[0], 0) / validZones.length;
    const avgLon = validZones.reduce((sum, zone) => sum + zone.coordinates[1], 0) / validZones.length;
    
    return [avgLat, avgLon];
  };

  // Calculer le zoom approprié
  const getMapZoom = () => {
    if (validZones.length === 0) return 6;
    if (validZones.length === 1) return 12;
    
    // Calculer la distance max entre les zones
    let maxDist = 0;
    for (let i = 0; i < validZones.length; i++) {
      for (let j = i + 1; j < validZones.length; j++) {
        const dist = Math.sqrt(
          Math.pow(validZones[i].coordinates[0] - validZones[j].coordinates[0], 2) +
          Math.pow(validZones[i].coordinates[1] - validZones[j].coordinates[1], 2)
        );
        maxDist = Math.max(maxDist, dist);
      }
    }
    
    // Adapter le zoom selon la distance
    if (maxDist < 0.1) return 11;
    if (maxDist < 0.5) return 10;
    if (maxDist < 1) return 9;
    if (maxDist < 2) return 8;
    return 7;
  };

  // Si aucune zone valide
  if (validZones.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Carte Interactive
            </h1>
            <p className="text-slate-600 mt-1">Visualisation géographique du trafic en temps réel</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <MapPin className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Aucune zone à afficher</h2>
          <p className="text-slate-500">
            En attente des données de trafic en temps réel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Carte Interactive
          </h1>
          <p className="text-slate-600 mt-1">Visualisation géographique du trafic en temps réel</p>
        </div>
        
        {/* Sélecteur de style de carte */}
        <div className="flex gap-2 bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
          {['streets', 'satellite', 'dark'].map((style) => (
            <button
              key={style}
              onClick={() => setMapType(style)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                mapType === style
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {style === 'streets' && 'Routes'}
              {style === 'satellite' && 'Satellite'}
              {style === 'dark' && 'Sombre'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte principale */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={mapStyles[mapType]}
            />
            
            {validZones.map((zone) => (
              <React.Fragment key={zone.id}>
                {/* Cercle de congestion */}
                <Circle
                  center={zone.coordinates}
                  radius={zone.congestion * 50} // Rayon proportionnel
                  pathOptions={{
                    color: getMarkerColor(zone.congestion),
                    fillColor: getMarkerColor(zone.congestion),
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                />
                
                {/* Marqueur */}
                <Marker
                  position={zone.coordinates}
                  icon={createCustomIcon(zone.congestion)}
                  eventHandlers={{
                    click: () => setSelectedZone(zone),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[220px]">
                      <h3 className="font-bold text-lg mb-3">{zone.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{zone.location}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-600">Congestion</span>
                            <span className="font-bold text-lg" style={{ color: getMarkerColor(zone.congestion) }}>
                              {zone.congestion}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${zone.congestion}%`,
                                backgroundColor: getMarkerColor(zone.congestion)
                              }}
                            />
                          </div>
                        </div>

                        {zone.current_speed && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-slate-600">Vitesse actuelle</span>
                            <span className="font-bold">{Math.round(zone.current_speed)} km/h</span>
                          </div>
                        )}

                        {zone.free_flow_speed && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Vitesse fluide</span>
                            <span className="font-bold text-green-600">{Math.round(zone.free_flow_speed)} km/h</span>
                          </div>
                        )}

                        {zone.vehicles && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            <Car className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-700">{zone.vehicles} véhicules (estimation)</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            zone.status === 'critical' ? 'bg-red-100 text-red-700' :
                            zone.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {zone.status === 'critical' ? 'Critique' :
                             zone.status === 'warning' ? 'Modéré' :
                             'Fluide'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Légende */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Légende
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-sm">Trafic Fluide (&lt; 40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span className="text-sm">Trafic Modéré (40-70%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                <span className="text-sm">Congestionné (&gt; 70%)</span>
              </div>
            </div>
          </div>

          {/* Zone sélectionnée */}
          {selectedZone ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h3 className="font-bold text-lg mb-4">Zone Sélectionnée</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-black" style={{ color: getMarkerColor(selectedZone.congestion) }}>
                    {selectedZone.congestion}%
                  </div>
                  <div className="text-sm text-slate-600">Niveau de congestion</div>
                </div>
                
                <div className="pt-3 border-t border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">{selectedZone.name}</div>
                  <div className="text-sm text-slate-600">{selectedZone.location}</div>
                </div>

                {selectedZone.current_speed && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-600">Vitesse actuelle</span>
                    <span className="font-bold">{Math.round(selectedZone.current_speed)} km/h</span>
                  </div>
                )}

                {selectedZone.vehicles && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Véhicules</span>
                    <span className="font-bold">{selectedZone.vehicles}</span>
                  </div>
                )}

                {selectedZone.trend && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tendance</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      selectedZone.trend === 'up' ? 'text-red-600' :
                      selectedZone.trend === 'down' ? 'text-green-600' :
                      'text-slate-600'
                    }`}>
                      {selectedZone.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {selectedZone.trend === 'up' ? 'Hausse' :
                       selectedZone.trend === 'down' ? 'Baisse' :
                       'Stable'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedZone(null)}
                  className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center text-slate-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Cliquez sur un marqueur pour voir les détails</p>
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="font-bold text-lg mb-4">Résumé</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones surveillées</span>
                <span className="font-bold text-blue-600">{validZones.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones fluides</span>
                <span className="font-bold text-green-600">
                  {validZones.filter(z => z.congestion < 40).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones modérées</span>
                <span className="font-bold text-orange-600">
                  {validZones.filter(z => z.congestion >= 40 && z.congestion <= 70).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones congestionnées</span>
                <span className="font-bold text-red-600">
                  {validZones.filter(z => z.congestion > 70).length}
                </span>
              </div>
              
              {validZones.length > 0 && (
                <>
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Congestion moyenne</span>
                      <span className="font-bold" style={{ 
                        color: getMarkerColor(
                          validZones.reduce((sum, z) => sum + z.congestion, 0) / validZones.length
                        )
                      }}>
                        {Math.round(validZones.reduce((sum, z) => sum + z.congestion, 0) / validZones.length)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;