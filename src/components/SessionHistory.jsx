import React from 'react';
import { Clock, Terminal, CheckCircle, Activity, PowerOff, AlertTriangle } from 'lucide-react';
import '../styles/components.css';

const SessionHistory = ({ history }) => {
    // Calcular tiempo: Hace 5 minutos
    const getRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const now = new Date();
        const date = new Date(dateString);
        const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

        if (diffSeconds < 60) return `${diffSeconds}s`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
        if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d`;
        if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)}sem`; // Semanas (aprox)
        if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)}mes`; // Meses (aprox)
        return `${Math.floor(diffSeconds / 31536000)}años`; // Años
    };

    return (
        <div className="session-history">
            <h3 className="session-history__title">
                <Terminal className="session-history__icon" />
                Sesiones de terminal
            </h3>
            {!history || history.length === 0 ? (
                <div className="session-history__empty-state">
                    <Clock className="session-history__icon--large" />
                    <p>No hay sesiones de terminal disponibles.</p>
                </div>
            ) : (
                <ul className="session-history__list">
                    {history.map((session) => (
                        <li key={session.id} className="session-history__item">
                            <div className="session-history__header">
                                <span className="session-history__command">
                                    {session.status === 'active' ? (
                                        <Activity size={18} color="#10b981" /> // Activo
                                    ) : session.status === 'closed' ? (
                                        <PowerOff size={18} color="#64748b" /> // Cerrado
                                    ) : session.status === 'error' ? (
                                        <AlertTriangle size={18} color="#ef4444" /> // Error
                                    ) : (
                                        <CheckCircle size={18} color="#10b981" /> // Defecto
                                    )}
                                    Sesión #{session.id}
                                </span>
                                <span className="session-history__user">
                                    {session.username || 'Desconocido'}
                                </span>
                            </div>
                            <div className="session-history__details">
                                <div className="session-history__details-col">
                                    <p><strong>Hace:</strong> {getRelativeTime(session.ended_at || session.started_at)}</p>
                                    <p><strong>Estado:</strong> {session.status === 'active' ? 'Activa' : session.status === 'closed' ? 'Cerrada' : session.status === 'error' ? 'Error' : session.status}</p>
                                    {session.duration && (
                                        <p><strong>Duración:</strong> {session.duration === 'Ongoing' ? 'En curso' : session.duration}</p>
                                    )}
                                </div>
                                <div className="session-history__details-col">
                                    <p><strong>Iniciada:</strong> {new Date(session.started_at).toLocaleString()}</p>
                                    {session.ended_at && (
                                        <p><strong>Finalizada:</strong> {new Date(session.ended_at).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SessionHistory;
