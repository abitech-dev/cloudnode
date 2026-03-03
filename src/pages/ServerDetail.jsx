import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import { useTerminal } from '../hooks/useTerminal';
import SessionHistory from '../components/SessionHistory';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Server, Terminal, ArrowLeft, Clock, Globe, User, Calendar, Activity, Trash2 } from 'lucide-react';
import '../styles/layout.css';

const ServerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getServerById, deleteServer } = useServers();
    const { sessions, fetchSessions } = useTerminal(id);
    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Cargar detalles del servidor y sesiones
    useEffect(() => {
        const loadData = async () => {
            try {
                const serverData = await getServerById(id);
                setServer(serverData);
                if (serverData.users && serverData.users.length > 0) {
                    setSelectedUser(serverData.users[0].id);
                }
                await fetchSessions();
            } catch (err) {
                setError("Error al cargar las sesiones del servidor.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, getServerById, fetchSessions]);

    // Eliminación de servidor
    const handleConfirmDelete = async () => {
        if (!server) return;
        setIsDeleting(true);
        try {
            await deleteServer(server.id);
            navigate('/servers');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Error eliminando servidor');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    // Abrir modal de confirmación
    const handleOpenConfirm = () => {
        setIsConfirmOpen(true);
    };

    // Cerrar modal de confirmación
    const handleCloseConfirm = () => {
        if (!isDeleting) {
            setIsConfirmOpen(false);
        }
    };

    if (loading) return <LoadingSpinner message="Cargando detalles del servidor..." />;
    if (error) return <ErrorMessage message={error} />;
    if (!server) return <ErrorMessage message="Servidor no encontrado." />;

    return (
        <div className="server-detail-page">
            <div className="page-header">
                <button
                    onClick={() => navigate(-1)}
                    className="page-header__btn-back"
                    title="Volver"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="page-header__divider"></div>
                <div className="page-header__content">
                    <h1 className="page-header__title">
                        <Server className="page-header__icon" />
                        {server.name}
                    </h1>
                    <p className="page-header__subtitle">Detalles y sesiones del servidor.</p>
                </div>
            </div>

            <div className="server-detail-page__content">
                <div className="server-detail-page__info-card">
                    <h2 className="server-detail-page__section-title">Información del servidor</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <Globe className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Dirección IP</span>
                                <span className="info-item__value">{server.ip}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Globe className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Puerto</span>
                                <span className="info-item__value">{server.port}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <User className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Total de usuarios</span>
                                <span className="info-item__value">{server.users ? server.users.length : 0}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Calendar className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Añadido el</span>
                                <span className="info-item__value">{new Date(server.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="info-item info-item--full-width">
                            <Clock className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Último uso</span>
                                <span className="info-item__value">
                                    {server.last_used_at ? new Date(server.last_used_at).toLocaleString() : 'Nunca'}
                                </span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Activity className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Total de sesiones</span>
                                <span className="info-item__value">{server.total_sessions !== undefined ? server.total_sessions : 0}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Clock className="info-item__icon" />
                            <div className="info-item__content">
                                <span className="info-item__label">Tiempo promedio</span>
                                <span className="info-item__value">{server.average_session_time || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="info-item info-item--connect">
                            <div className="server-detail-page__connect-container">
                                <div className="server-detail-page__danger">
                                    {/* // Botón de eliminar servidor */}
                                    <button
                                        type="button"
                                        className="btn btn--danger btn--sm"
                                        onClick={handleOpenConfirm}
                                        disabled={isDeleting}
                                        title="Eliminar servidor"
                                    >
                                        <Trash2 className="btn__icon" />
                                        <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
                                    </button>
                                </div>
                                <h3 className="server-detail-page__connect-title">Conéctate a tu servidor</h3>
                                {server.users && server.users.length > 0 ? (
                                    <div className="server-detail-page__connect-group">
                                        <div className="server-detail-page__select-wrapper">
                                            <User className="server-detail-page__select-icon" size={16} />
                                            {/* // Selector de usuarios */}
                                            <select 
                                                className="server-detail-page__select"
                                                value={selectedUser}
                                                onChange={(e) => setSelectedUser(e.target.value)}
                                            >
                                                {server.users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.username}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* // Botón de conexión */}
                                        <Link to={`/terminal/${server.id}/${selectedUser}`} className="btn btn--primary">
                                            <Terminal className="btn__icon" /> Conectar
                                        </Link>
                                    </div>
                                ) : (
                                    // Estado vacío de usuarios
                                    <Link to={`/servers/${server.id}/add-user`} className="btn btn--primary">
                                        <User className="btn__icon" /> Añadir usuario para conectar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="server-detail-page__history-section">
                    <SessionHistory history={sessions} />
                </div>
            </div>
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar servidor"
                message="Vas a eliminar este servidor de forma permanente. Esta accion no se puede deshacer."
                confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseConfirm}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ServerDetail;
