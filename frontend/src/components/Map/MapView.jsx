import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Layers, Info, TrendingUp, Car, AlertTriangle } from 'lucide-react';
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

  // Coordonnées des grandes villes françaises
  const cityCoordinates = {
    'Paris': [48.8566, 2.3522],
    'Lyon': [45.7640, 4.8357],
    'Bordeaux': [44.8378, -0.5792],
    'Marseille': [43.2965, 5.3698],
    'Toulouse': [43.6047, 1.4442],
    'Nice': [43.7102, 7.2620],
  };

  // Enrichir les zones avec des coordonnées
  const enrichedZones = zones.map(zone => ({
    ...zone,
    coordinates: cityCoordinates[zone.location] || [48.8566, 2.3522],
  }));

  // Couleur selon le niveau de congestion
  const getMarkerColor = (congestion) => {
    if (congestion > 70) return '#ef4444';
    if (congestion > 40) return '#f59e0b';
    return '#22c55e';
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
            center={[46.603354, 1.888334]} // Centre de la France
            zoom={6}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={mapStyles[mapType]}
            />
            
            {enrichedZones.map((zone) => (
              <React.Fragment key={zone.id}>
                {/* Cercle de congestion */}
                <Circle
                  center={zone.coordinates}
                  radius={zone.congestion * 500}
                  pathOptions={{
                    color: getMarkerColor(zone.congestion),
                    fillColor: getMarkerColor(zone.congestion),
                    fillOpacity: 0.2,
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
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>{zone.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-500" />
                          <span>Congestion: <strong style={{ color: getMarkerColor(zone.congestion) }}>
                            {zone.congestion}%
                          </strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-500" />
                          <span>{zone.vehicles} véhicules</span>
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
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Trafic Fluide (&lt; 40%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm">Trafic Modéré (40-70%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
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
                  <div className="text-2xl font-black" style={{ color: getMarkerColor(selectedZone.congestion) }}>
                    {selectedZone.congestion}%
                  </div>
                  <div className="text-sm text-slate-600">Niveau de congestion</div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="font-bold text-slate-900">{selectedZone.name}</div>
                  <div className="text-sm text-slate-600">{selectedZone.location}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Véhicules</span>
                  <span className="font-bold">{selectedZone.vehicles}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Tendance</span>
                  <span className={`font-bold ${
                    selectedZone.trend === 'up' ? 'text-red-600' :
                    selectedZone.trend === 'down' ? 'text-green-600' :
                    'text-slate-600'
                  }`}>
                    {selectedZone.trend === 'up' ? '↑ Hausse' :
                     selectedZone.trend === 'down' ? '↓ Baisse' :
                     '→ Stable'}
                  </span>
                </div>
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
                <span className="font-bold text-blue-600">{zones.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones fluides</span>
                <span className="font-bold text-green-600">
                  {zones.filter(z => z.congestion < 40).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Zones congestionnées</span>
                <span className="font-bold text-red-600">
                  {zones.filter(z => z.congestion > 70).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;