// API service for demo purposes
export const trafficAPI = {
  getLiveZones: () => Promise.resolve({
    data: [
      { id: 1, name: 'Périphérique Est', location: 'Paris', congestionLevel: 85 },
      { id: 2, name: 'A6 Sud', location: 'Lyon', congestionLevel: 45 },
      { id: 3, name: 'Rocade Ouest', location: 'Bordeaux', congestionLevel: 72 },
      { id: 4, name: 'A7 Nord', location: 'Marseille', congestionLevel: 38 },
    ]
  }),
  
  getAggregateStats: () => Promise.resolve({
    data: {
      averageCongestion: 60,
      activeAlerts: 3,
      peakHours: '08:00-10:00'
    }
  }),
  
  getTopCongested: (limit) => Promise.resolve({
    data: [
      { id: 1, name: 'Périphérique Est', location: 'Paris', congestionLevel: 85 },
      { id: 3, name: 'Rocade Ouest', location: 'Bordeaux', congestionLevel: 72 },
      { id: 5, name: 'A1 Nord', location: 'Lille', congestionLevel: 68 },
    ]
  }),
  
  getGlobalAlerts: () => Promise.resolve({
    data: { critical: 1, warning: 2, info: 0 }
  })
};