import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import ServerStats from '../components/ServerStats';
import ServerCard from '../components/ServerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Server, Activity, ArrowRight, PlusCircle } from 'lucide-react';
import '../styles/layout.css';

const Dashboard = () => {
    const { servers, loading, error, updateServer } = useServers();
    const navigate = useNavigate();

    if (loading) return <LoadingSpinner message="Cargando dashboard..." />;
    if (error) return <ErrorMessage message={error} />;

    // Ordenar servidores por último uso
    const recentServers = [...servers].sort((a, b) => {
        const dateA = a.last_used_at ? new Date(a.last_used_at) : new Date(a.created_at);
        const dateB = b.last_used_at ? new Date(b.last_used_at) : new Date(b.created_at);
        return dateB - dateA;
    });

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h1 className="dashboard__title">
                    <Activity className="dashboard__icon" />
                    Resumen
                </h1>
                <p className="dashboard__subtitle">Bienvenido. Gestiona y conéctate a tus servidores de forma rápida y segura.</p>
            </div>

            {/* // Estadísticas generales */}
            <ServerStats servers={servers} />

            <div className="dashboard__section">
                <div className="dashboard__section-header">
                    <h2 className="dashboard__section-title">
                        <Server className="dashboard__section-icon" size={20} />
                        Servidores recientes
                    </h2>
                    <div className="dashboard__section-actions">
                        {/* // Agregar nuevo servidor */}
                        <button 
                            onClick={() => navigate('/servers', { state: { isAdding: true } })} 
                            className="btn btn--primary btn--sm"
                        >
                            <PlusCircle size={16} /> Nuevo
                        </button>
                        {/* // Ver todos los servidores */}
                        <Link to="/servers" className="dashboard__view-all">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
                <div className="server-grid">
                    {/* // Mostrar servidores */}
                    {recentServers.slice(0, 3).map(server => (
                        <ServerCard key={server.id} server={server} onUpdate={updateServer} />
                    ))}
                    {recentServers.length === 0 && (
                        <div className="empty-state">
                            <Server className="empty-state__icon" />
                            <p>Aún no hay servidores. Comienza agregando tu primer servidor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
