import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CongestionChart = ({ zones }) => {
  // Données de démo pour le graphique
  const chartData = [
    { time: '06:00', congestion: 20 },
    { time: '08:00', congestion: 75 },
    { time: '10:00', congestion: 45 },
    { time: '12:00', congestion: 60 },
    { time: '14:00', congestion: 40 },
    { time: '16:00', congestion: 80 },
    { time: '18:00', congestion: 85 },
    { time: '20:00', congestion: 35 },
  ];

  const maxCongestion = Math.max(...chartData.map(d => d.congestion));
  const currentTrend = chartData[chartData.length - 1].congestion > chartData[chartData.length - 2].congestion ? 'up' : 'down';

  return (
    <div className="congestion-chart">
      {/* Header avec tendance */}
      <div className="chart-header">
        <div className="trend-indicator">
          {currentTrend === 'up' ? (
            <div className="trend-up">
              <TrendingUp className="w-4 h-4" />
              <span>Tendance à la hausse</span>
            </div>
          ) : (
            <div className="trend-down">
              <TrendingDown className="w-4 h-4" />
              <span>Tendance à la baisse</span>
            </div>
          )}
        </div>
        <div className="chart-stats">
          <div className="stat">
            <span className="label">Max:</span>
            <span className="value">{maxCongestion}%</span>
          </div>
          <div className="stat">
            <span className="label">Actuel:</span>
            <span className="value">{chartData[chartData.length - 1].congestion}%</span>
          </div>
        </div>
      </div>

      {/* Graphique simple */}
      <div className="chart-container">
        <div className="chart-bars">
          {chartData.map((data, index) => {
            const height = (data.congestion / maxCongestion) * 100;
            const getBarColor = (congestion) => {
              if (congestion > 70) return 'bg-red-500';
              if (congestion > 40) return 'bg-yellow-500';
              return 'bg-green-500';
            };

            return (
              <div key={index} className="chart-bar-group">
                <div className="chart-bar-container">
                  <div
                    className={`chart-bar ${getBarColor(data.congestion)}`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="bar-tooltip">
                      {data.congestion}%
                    </div>
                  </div>
                </div>
                <div className="chart-label">
                  {data.time}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Ligne de référence */}
        <div className="chart-grid">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>
      </div>

      {/* Légende */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Fluide (&lt;40%)</span>
        </div>
        <div className="legend-item">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Modéré (40-70%)</span>
        </div>
        <div className="legend-item">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Congestionné (&gt;70%)</span>
        </div>
      </div>
    </div>
  );
};

export default CongestionChart;