import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useServers = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchServers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/servers/');
            setServers(response.data);
        } catch (err) {
            setError(err.message || 'Error obteniendo servidores');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    // Crear nuevo servidor
    const addServer = async (data) => {
        try {
            const response = await api.post('/servers/', data);
            setServers(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            throw err;
        } 
    };

    // Actualizar servidor
    const updateServer = async (id, data) => {
        try {
            const response = await api.patch(`/servers/${id}/`, data);
            setServers(prev => prev.map(server => (server.id === id ? response.data : server)));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    // Eliminar servidor
    const deleteServer = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/servers/${id}/`);
            setServers(prev => prev.filter(server => server.id !== id));
        } catch (err) {
            setError(err.response?.data || err.message || 'Error eliminando servidor');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Obtener detalles del servidor
    const getServerById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/servers/${id}/`);
            return response.data;
        } catch (err) {
            setError(err.message || 'Error obteniendo detalles del servidor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);


    // Agregar usuario a servidor
    const addServerUser = async (serverId, userData) => {
        setLoading(true);
        setError(null);
        try {
            const payload = { ...userData, server: serverId };
            await api.post('/server-users/', payload);
        
            await fetchServers();
        } catch (err) {
            setError(err.response?.data || err.message || 'Error agregando usuario');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Actualizar usuario de servidor
    const updateServerUser = async (userId, userData) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/server-users/${userId}/`, userData);
            await fetchServers();
        } catch (err) {
            setError(err.response?.data || err.message || 'Error actualizando usuario');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar usuario de servidor
    const deleteServerUser = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/server-users/${userId}/`);
            await fetchServers();
        } catch (err) {
            setError(err.response?.data || err.message || 'Error eliminando usuario');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Filtrar servidores según búsqueda
    const filteredServers = servers.filter(server => {
        const query = searchQuery.toLowerCase();
        // Por nombre o IP del servidor
        const matchesServer = (
            server.name.toLowerCase().includes(query) ||
            server.ip.toLowerCase().includes(query)
        );
        // O por nombre de usuario
        const matchesUser = server.users && server.users.some(user => 
            user.username.toLowerCase().includes(query)
        );
        return matchesServer || matchesUser;
    });

    return {
        servers: filteredServers,
        allServers: servers,
        loading,
        error,
        fetchServers,
        addServer,
        addServerUser,
        updateServerUser,
        deleteServerUser,
        updateServer,
        deleteServer,
        getServerById,
        searchQuery,
        setSearchQuery
    };
};
