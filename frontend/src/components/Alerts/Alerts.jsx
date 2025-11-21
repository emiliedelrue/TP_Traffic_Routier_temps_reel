import React, { useState, useEffect } from "react";

const Alerts = () => {
  const [alertsList, setAlertsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/alerts");
        const data = await res.json();
        setAlertsList(data);
      } catch (error) {
        console.error("Erreur lors du chargement des alertes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-600">
        Chargement des alertes depuis HDFS...
      </div>
    );
  }

  const typeIcons = {
    critical: {
      color: "bg-red-100 text-red-600",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4m0 4h.01"></path>
          <path d="M4.93 4.93l14.14 14.14"></path>
        </svg>
      ),
    },
    warning: {
      color: "bg-yellow-100 text-yellow-600",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 9v3m0 3h.01"></path>
          <path d="M10 4l2-2 2 2m-2-2v6"></path>
        </svg>
      ),
    },
    info: {
      color: "bg-blue-100 text-blue-600",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 16h-1v-4h-1m1-4h.01"></path>
        </svg>
      ),
    },
  };

  const statusIcons = {
    active: "bg-red-100 text-red-600",
    ongoing: "bg-orange-100 text-orange-600",
    resolved: "bg-green-100 text-green-600",
  };

 
  const getAlertTitle = (alert) => {
    if (alert.type === "critical") {
      return ` Trafic Bloqué - ${alert.zone_name}`;
    } else if (alert.type === "warning") {
      return ` Trafic Dense - ${alert.zone_name}`;
    } else {
      return ` Ralentissement - ${alert.zone_name}`;
    }
  };

  const getEstimatedDuration = (congestionLevel) => {
    if (congestionLevel > 80) {
      return "> 30 min";
    } else if (congestionLevel > 50) {
      return "15-30 min";
    } else {
      return "< 15 min";
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-200">
      <h1 className="text-3xl font-bold mb-6 text-white">Alertes Trafic</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des alertes */}
        <div className="lg:col-span-2 space-y-4">
          {alertsList.length === 0 ? (
            <div className="bg-slate-800 p-8 rounded-xl text-center">
              <p className="text-slate-400">Aucune alerte pour le moment</p>
            </div>
          ) : (
            alertsList.map((alert) => {
              const icon = typeIcons[alert.type] || typeIcons.info;

              return (
                <div
                  key={alert.id}
                  className="bg-slate-800 p-5 rounded-xl shadow-lg hover:bg-slate-700 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Icône type */}
                    <div className={`p-3 rounded-full ${icon.color}`}>
                      {icon.icon}
                    </div>

                    {/* Infos alerte */}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1">
                        {getAlertTitle(alert)}
                      </h2>

                      <p className="text-slate-400 mb-1">
                         <span className="text-slate-300">{alert.zone_name}</span>
                      </p>

                      <p className="text-slate-400 mb-1">
                         Congestion:{" "}
                        <span className="text-slate-300 font-semibold">
                          {alert.congestion_level?.toFixed(1)}%
                        </span>
                      </p>

                      <p className="text-slate-400 mb-1">
                         Vitesse actuelle:{" "}
                        <span className="text-slate-300 font-semibold">
                          {alert.current_speed?.toFixed(0)} km/h
                        </span>
                      </p>

                      <p className="text-slate-400 mb-2">
                        {" "}
                        <span className="text-slate-300">
                          {new Date(alert.time).toLocaleString("fr-FR")}
                        </span>
                      </p>

                      <p className="text-slate-400">
                         Durée estimée:{" "}
                        <span className="text-slate-300">
                          {getEstimatedDuration(alert.congestion_level)}
                        </span>
                      </p>
                    </div>

                    {/* Badge statut */}
                    <div
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        statusIcons[alert.status] ||
                        "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {alert.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Statistiques*/}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-6">
          <h2 className="text-xl font-bold text-white">Statistiques</h2>

          {/* Total */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Total des alertes</p>
            <p className="text-3xl font-bold text-white">{alertsList.length}</p>
          </div>

          {/* Types */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold pb-2 border-b border-slate-700">
              Par type
            </h3>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Critiques
              </span>
              <span className="font-bold text-red-400">
                {alertsList.filter((a) => a.type === "critical").length}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Avertissements
              </span>
              <span className="font-bold text-yellow-400">
                {alertsList.filter((a) => a.type === "warning").length}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Infos
              </span>
              <span className="font-bold text-blue-400">
                {alertsList.filter((a) => a.type === "info").length}
              </span>
            </div>
          </div>

          {/* Statuts */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold pb-3">Par statut</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span> Actives</span>
                <span className="font-bold">
                  {alertsList.filter((a) => a.status === "active").length}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span> En cours</span>
                <span className="font-bold">
                  {alertsList.filter((a) => a.status === "ongoing").length}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span> Résolues</span>
                <span className="font-bold">
                  {alertsList.filter((a) => a.status === "resolved").length}
                </span>
              </div>
            </div>
          </div>

          {/* Vitesse moyenne */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold pb-3">Vitesse moyenne</h3>
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">
                {alertsList.length > 0
                  ? (
                      alertsList.reduce(
                        (acc, alert) => acc + (alert.current_speed || 0),
                        0
                      ) / alertsList.length
                    ).toFixed(1)
                  : 0}
                <span className="text-sm text-slate-400 ml-1">km/h</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;