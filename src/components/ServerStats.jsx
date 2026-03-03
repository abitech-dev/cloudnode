import React from 'react';
import { Server, User, Activity } from 'lucide-react';
import '../styles/components.css';

const ServerStats = ({ servers }) => {
    // Calcular estadísticas
    const totalServers = servers.length;
    const totalUsers = servers.reduce((acc, server) => acc + (server.users?.length || 0), 0);
    const totalSessions = servers.reduce((acc, server) => acc + (server.total_sessions || 0), 0);

    return (
        <div className="server-stats">
            <div className="server-stats__card">
                <div className="server-stats__icon-container server-stats__icon-container--primary">
                    <Server className="server-stats__icon" />
                </div>
                <div className="server-stats__info">
                    <h4 className="server-stats__title">Servidores</h4>
                    <p className="server-stats__value">{totalServers}</p>
                </div>
            </div>
            <div className="server-stats__card">
                <div className="server-stats__icon-container server-stats__icon-container--success">
                    <User className="server-stats__icon" />
                </div>
                <div className="server-stats__info">
                    <h4 className="server-stats__title">Usuarios</h4>
                    <p className="server-stats__value">{totalUsers}</p>
                </div>
            </div>
            <div className="server-stats__card">
                <div className="server-stats__icon-container server-stats__icon-container--warning">
                    <Activity className="server-stats__icon" />
                </div>
                <div className="server-stats__info">
                    <h4 className="server-stats__title">Sesiones</h4>
                    <p className="server-stats__value">{totalSessions}</p>
                </div>
            </div>
        </div>
    );
};

export default ServerStats;
