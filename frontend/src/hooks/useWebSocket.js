import { useEffect, useRef, useState } from 'react';

/**
 * Hook personnalisé pour gérer la connexion WebSocket temps réel
 * 
 * Usage:
 * const { data, status, error } = useWebSocket('ws://localhost:8000/ws');
 * 
 * Note: Le backend doit implémenter un endpoint WebSocket
 */
const useWebSocket = (url, options = {}) => {
  const {
    onOpen = () => {},
    onClose = () => {},
    onError = () => {},
    onMessage = () => {},
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = () => {
    try {
      setStatus('connecting');
      setError(null);

      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setStatus('connected');
        setReconnectAttempts(0);
        onOpen();
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setStatus('disconnected');
        onClose();

        // Tentative de reconnexion automatique
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Tentative de reconnexion (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
          reconnectTimeout.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, reconnectDelay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          setError('Impossible de se connecter au serveur WebSocket');
        }
      };

      ws.current.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        setStatus('error');
        setError('Erreur de connexion WebSocket');
        onError(err);
      };

      ws.current.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          onMessage(parsedData);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setData(event.data);
          onMessage(event.data);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setStatus('disconnected');
  };

  const send = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      ws.current.send(payload);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [url]);

  return {
    data,
    status,
    error,
    send,
    reconnect: connect,
    disconnect,
    isConnected: status === 'connected',
  };
};

export default useWebSocket;
