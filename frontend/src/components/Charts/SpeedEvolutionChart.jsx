import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { trafficAPI } from '../../services/api';

const SpeedEvolutionChart = ({ zoneId = null }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHours, setSelectedHours] = useState(24);

  useEffect(() => {
    if (zoneId) {
      loadHistory();
    }
  }, [zoneId, selectedHours]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await trafficAPI.getZoneHistory(zoneId, selectedHours);
      
      const formattedData = response.data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        vitesse: item.avg_speed,
        congestion: item.congestion_level,
      }));
      
      setHistoryData(formattedData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!zoneId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📈 Évolution de la Vitesse
        </h2>
        <div className="text-center py-12 text-gray-500">
          Cliquez sur une zone de la carte pour voir son historique
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">📈 Évolution de la Vitesse</h2>
        
        <div className="flex gap-2">
          {[6, 12, 24, 48].map((hours) => (
            <button
              key={hours}
              onClick={() => setSelectedHours(hours)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                selectedHours === hours
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Vitesse (km/h)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Congestion (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="vitesse"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorSpeed)"
              name="Vitesse moyenne"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="congestion"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorCongestion)"
              name="Congestion"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SpeedEvolutionChart;
