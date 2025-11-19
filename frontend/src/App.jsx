import React, { useEffect, useState } from 'react';
import TrafficMap from './components/Map/TrafficMap';
import KPICards from './components/Dashboard/KPICards';
import TopCongested from './components/Dashboard/TopCongested';
import useTrafficStore from './store/trafficStore';
import { trafficAPI } from './services/api';

function App() {
  const { zones, stats, topCongested, setZones, setStats, setTopCongested } = useTrafficStore();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesRes, statsRes, topRes] = await Promise.all([
        trafficAPI.getLiveZones(),
        trafficAPI.getAggregateStats(),
        trafficAPI.getTopCongested(5),
      ]);
      
      setZones(zonesRes.data);
      setStats(statsRes.data);
      setTopCongested(topRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🚗</span>
                Traffic Monitor
                <span className="ml-3 text-2xl">📡</span>
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Monitoring en temps réel du trafic routier - Paris & Région
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-lg font-semibold text-gray-700">
                {lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
              <button 
                onClick={loadData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && zones.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            <KPICards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">🗺️ Carte de Congestion en Temps Réel</h2>
                  <TrafficMap zones={zones} />
                </div>
              </div>
              <div>
                <TopCongested zones={topCongested} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-600 font-semibold text-sm">Fluide</p>
                <p className="text-3xl font-bold text-green-700">{stats.fluide}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-600 font-semibold text-sm">Modéré</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.modere}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <p className="text-orange-600 font-semibold text-sm">Dense</p>
                <p className="text-3xl font-bold text-orange-700">{stats.dense}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-semibold text-sm">Bloqué</p>
                <p className="text-3xl font-bold text-red-700">{stats.bloque}</p>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Traffic Monitor - Big Data Project 2025</p>
          <p className="mt-1">Architecture: Kafka → Spark → HDFS → FastAPI → React</p>
        </div>
      </footer>
    </div>
  );
}

export default App;