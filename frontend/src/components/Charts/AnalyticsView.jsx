import React from 'react';

const AnalyticsView = ({ zones, stats, selectedZone }) => {
  return (
    <div className="analytics-container">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3 className="card-title">Analyses Détaillées</h3>
          <p className="text-slate-600">
            Vue analytique avancée avec graphiques et tendances
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;