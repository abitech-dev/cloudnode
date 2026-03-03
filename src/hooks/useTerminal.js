import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';

export const useTerminal = (serverId, userId = null) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null); // Referencia al WebSocket

    // Obtener el historial de sesiones
    const fetchSessions = useCallback(async () => {
        if (!serverId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/servers/${serverId}/history/`);
            setSessions(response.data);
        } catch (err) {
            setError(err.message || 'Error obteniendo historial de sesiones');
        } finally {
            setLoading(false);
        }
    }, [serverId]);

    // Conectar al WebSocket
    const connectWebSocket = useCallback((onDataReceived) => {
        if (!serverId || !userId) return null;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = process.env.REACT_APP_BACKEND_URL 
            ? new URL(process.env.REACT_APP_BACKEND_URL).host 
            : 'localhost:8000';
        
        const wsUrl = `${wsProtocol}//${apiHost}/ws/terminal/${serverId}/${userId}/`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Eventos del WebSocket
        ws.onopen = () => {
            console.log('WebSocket Conectado');
        };

        // Recibir datos del WebSocket
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'output' || data.type === 'error') {
                // console.log('Recibido:', data.message);
                onDataReceived(data.message);
            }
        };

        // Manejar errores del WebSocket
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            onDataReceived('\r\n\x1b[31mWebSocket connection error.\x1b[0m\r\n');
        };

        // Manejar cierre del WebSocket
        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            onDataReceived('\r\n\x1b[33mConexión cerrada.\x1b[0m\r\n');
        };

        return ws;
    }, [serverId]);

    // Desconectar el WebSocket
    const disconnectWebSocket = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    // Enviar comando al WebSocket
    const sendCommand = useCallback((command) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ command }));
        }
    }, []);

    // Enviar cambio de tamaño al WebSocket
    const sendResize = useCallback((cols, rows) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ resize: { cols, rows } }));
        }
    }, []);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, [disconnectWebSocket]);

    return {
        sessions,
        loading,
        error,
        fetchSessions,
        connectWebSocket,
        disconnectWebSocket,
        sendCommand,
        sendResize
    };
};
