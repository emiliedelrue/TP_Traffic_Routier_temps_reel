import React from 'react';

const MapView = ({ zones, selectedZone, setSelectedZone }) => {
  return (
    <div className="map-container">
      <div className="map-placeholder">
        <div className="map-content">
          <h3 className="text-lg font-semibold text-slate-700">
            Carte du Trafic en Temps Réel
          </h3>
          <p className="text-slate-500 mt-2">
            Intégration Leaflet/Google Maps prévue
          </p>
          <div className="mt-4 p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-600">
              {zones.length} zones de trafic surveillées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;