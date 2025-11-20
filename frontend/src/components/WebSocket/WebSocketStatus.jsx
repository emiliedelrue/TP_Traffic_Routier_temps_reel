import React from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import useTrafficStore from '../../store/trafficStore';

/**
 * Composant pour afficher le statut de connexion WebSocket
 * 
 * Pour activer le WebSocket temps réel :
 * 1. Décommenter l'import de ce composant dans App.jsx
 * 2. Implémenter l'endpoint WebSocket dans le backend FastAPI
 * 3. Remplacer le polling par le push WebSocket
 */
const WebSocketStatus = () => {
  const { setZones, setStats, setTopCongested } = useTrafficStore();

  const { status, error, isConnected } = useWebSocket(
    'ws://localhost:8000/ws/traffic',
    {
      onOpen: () => {
        console.log('🎉 Connexion WebSocket établie - Données en temps réel activées !');
      },
      onMessage: (data) => {
        console.log('📡 Données reçues via WebSocket:', data);
        
        // Mise à jour du store avec les données reçues
        if (data.zones) setZones(data.zones);
        if (data.stats) setStats(data.stats);
        if (data.topCongested) setTopCongested(data.topCongested);
      },
      onError: (err) => {
        console.error('❌ Erreur WebSocket:', err);
      },
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
    }
  );

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connecté';
      case 'connecting':
        return 'Connexion...';
      case 'disconnected':
        return 'Déconnecté';
      case 'error':
        return 'Erreur';
      default:
        return 'Inactif';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'connecting':
        return '⏳';
      case 'disconnected':
        return '🔌';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white ${
        isConnected ? 'bg-green-600' : 'bg-gray-600'
      }`}>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm font-medium">
          {getStatusIcon()} WebSocket: {getStatusText()}
        </span>
      </div>
      
      {error && (
        <div className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
