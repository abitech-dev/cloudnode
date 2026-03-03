import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import ServerCard from '../components/ServerCard';
import ServerStats from '../components/ServerStats';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Server, PlusCircle, FilterX } from 'lucide-react';
import '../styles/layout.css';

const ServerList = () => {
    const { servers, allServers, loading, error, searchQuery, setSearchQuery, updateServer, addServer } = useServers();
    const location = useLocation();
    const showLoader = new URLSearchParams(location.search).get('showLoader') === '1';
    const [isAdding, setIsAdding] = useState(false);
    const [selectedServerId, setSelectedServerId] = useState('');

    // Detectar agregar servidor
    useEffect(() => {
        if (location.state?.isAdding) {
            setIsAdding(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Agregar nuevo servidor
    const handleAddClick = (e) => {
        e.preventDefault();
        setIsAdding(true);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedServerId('');
    };

    // Cancelar agregar servidor
    const handleCancelAdd = () => {
        setIsAdding(false);
    };

    // Guardar nuevo servidor
    const handleSaveAdd = async (serverData) => {
        try {
            await addServer(serverData);
            setIsAdding(false);
        } catch (error) {
            console.error("Error al agregar servidor:", error);
        }
    };

    if (showLoader || (loading && servers.length === 0 && !isAdding)) {
        return <LoadingSpinner message="Cargando servidores..." />;
    }
    if (error) return <ErrorMessage message={error} />;

    // Filtrar por búsqueda y selección
    const displayedServers = selectedServerId 
        ? servers.filter(s => s.id.toString() === selectedServerId)
        : servers;

    return (
        <div className="server-list-page">
            <div className="server-list-page__header">
                <h1 className="server-list-page__title">
                    <Server className="server-list-page__icon" />
                    Gestionar servidores
                </h1>
                <button onClick={handleAddClick} className="btn btn--primary btn--sm">
                    <PlusCircle className="btn__icon" /> Agregar
                </button>
            </div>

            {/* // Mostrar estadísticas */}
            <ServerStats servers={allServers || servers} />

            {/* // Busqueda y filtro */}
            <div className="server-list-page__controls">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar por nombre o IP del servidor..."
                />
                <div className="server-list-page__filters">
                    <select 
                        className="server-list-page__filter"
                        value={selectedServerId}
                        onChange={(e) => setSelectedServerId(e.target.value)}
                    >
                        <option value="">Todos los servidores</option>
                        {allServers?.map(server => (
                            <option key={server.id} value={server.id}>
                                {server.name} ({server.ip})
                            </option>
                        ))}
                    </select>
                    <button 
                        className="btn btn--icon-only" 
                        onClick={handleClearFilters}
                        title="Limpiar filtros"
                    >
                        <FilterX size={20} />
                    </button>
                </div>
            </div>

            <div className="server-grid">
                {/* // Agregar servidor */}
                {isAdding && (
                    <ServerCard 
                        server={{ 
                            name: '', 
                            ip: '', 
                            port: 22, 
                            username: '', 
                            auth_type: 'password' 
                        }} 
                        isNew={true}
                        onSaveNew={handleSaveAdd}
                        onCancelNew={handleCancelAdd}
                    />
                )}
                
                {/* // Servidores filtrados */}
                {displayedServers.length > 0 ? (
                    displayedServers.map(server => (
                        <ServerCard key={server.id} server={server} onUpdate={updateServer} />
                    ))
                ) : (
                    !isAdding && (
                        <div className="empty-state">
                            <Server className="empty-state__icon" />
                            {searchQuery || selectedServerId ? (
                                <p>No se encontraron servidores que coincidan con tu busqueda.</p>
                            ) : (
                                <>
                                    <p>No hay servidores registrados todavia.</p>
                                    <button
                                        type="button"
                                        className="btn btn--primary btn--sm"
                                        onClick={handleAddClick}
                                    >
                                        <PlusCircle className="btn__icon" /> Agregar servidor
                                    </button>
                                </>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ServerList;
