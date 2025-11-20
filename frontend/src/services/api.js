const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Récupère les zones de trafic en temps réel depuis l'API
 */
export const fetchLiveZones = async () => {
  try {
    const response = await fetch(`${API_URL}/zones/live`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des zones:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques globales
 */
export const fetchAggregateStats = async () => {
  try {
    const response = await fetch(`${API_URL}/aggregates/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    throw error;
  }
};

/**
 * Récupère les zones les plus congestionnées
 */
export const fetchTopCongested = async (limit = 5) => {
  try {
    const response = await fetch(`${API_URL}/zones/top-congested?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du top congestionné:', error);
    throw error;
  }
};

/**
 * Transforme les données de l'API au format attendu par le frontend
 */
export const transformZoneData = (apiZone) => {
  // Mapping des statuts
  const statusMap = {
    'Fluide': 'normal',
    'Modéré': 'warning',
    'Dense': 'warning',
    'Bloqué': 'critical'
  };

  // Déterminer la tendance (à améliorer avec historique)
  const trend = apiZone.congestion_level > 60 ? 'up' : 
                apiZone.congestion_level < 30 ? 'down' : 'stable';

  return {
    id: apiZone.zone_id,
    name: apiZone.zone_name,
    location: apiZone.zone_name, // Ou extraire la ville si besoin
    congestion: Math.round(apiZone.congestion_level),
    trend: trend,
    vehicles: Math.round(apiZone.current_speed * 10), // Estimation
    status: statusMap[apiZone.status] || 'normal',
    coordinates: [apiZone.latitude, apiZone.longitude],
    current_speed: apiZone.current_speed,
    free_flow_speed: apiZone.free_flow_speed,
  };
};

/**
 * Transforme les stats agrégées
 */
export const transformAggregateStats = (apiStats) => {
  return {
    averageCongestion: Math.round(apiStats.avg_global_congestion || 0),
    activeAlerts: 0, // À implémenter si vous avez des alertes
    totalZones: apiStats.total_zones || 0,
    totalVehicles: apiStats.total_zones * 800, // Estimation
    peakHours: '08:00-10:00', // Statique pour l'instant
    fluide: apiStats.fluide || 0,
    modere: apiStats.modere || 0,
    dense: apiStats.dense || 0,
    bloque: apiStats.bloque || 0,
  };
};