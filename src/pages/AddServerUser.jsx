import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import UserForm from '../components/UserForm';
import '../styles/components.css';
import '../styles/layout.css';

const AddServerUser = () => {
    const { id, serverId, userId } = useParams();
    const navigate = useNavigate();
    const { getServerById } = useServers();
    
    const effectiveServerId = serverId || id;
    const isEditMode = !!userId;
    
    const [server, setServer] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Cargar datos del servidor y usuario
    useEffect(() => {
        const loadWrapper = async () => {
            try {
                if (!effectiveServerId) {
                    console.error("No se proporcionó ID de servidor");
                    setPageLoading(false);
                    return;
                }
                const serverData = await getServerById(effectiveServerId);
                setServer(serverData);
                
                if (isEditMode) {
                    if (serverData && serverData.users) {
                        const targetId = userId.toString();
                        const foundUser = serverData.users.find(u => u.id.toString() === targetId);
                        
                        if (foundUser) {
                            setUserToEdit(foundUser);
                        } else {
                            console.error(`Usuario con ID ${userId} no encontrado en el servidor ${effectiveServerId}`);
                        }
                    } else {
                        console.error("Servidor no tiene lista de usuarios.");
                    }
                }
            } catch (err) {
                console.error("Error loading data", err);
            } finally {
                setPageLoading(false);
            }
        };
        loadWrapper();
    }, [effectiveServerId, userId, isEditMode, getServerById]);

    if (pageLoading) return <LoadingSpinner message="Cargando detalles..." />;
    if (!server) return <ErrorMessage message="Servidor no encontrado" />;
    if (isEditMode && !userToEdit) return <ErrorMessage message="Usuario no encontrado en este servidor" />;

    return (
        <div className="add-server-page">
            <div className="add-server-form-container">
                <div className="page-header">
                    {/* // Regresar a servidores */}
                    <button 
                        onClick={() => navigate('/servers')} 
                        className="page-header__btn-back" 
                        title="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="page-header__divider"></div>
                    <div className="page-header__content">
                        <h2 className="page-header__title">{isEditMode ? 'Editar Usuario SSH' : 'Usuario SSH'}</h2>
                        <p className="page-header__subtitle">
                            {isEditMode ? 'Edita el usuario SSH del servidor' : 'Agrega nuevo usuario SSH al servidor'} <strong>{server.name}</strong>.
                        </p>
                    </div>
                </div>

                {/* // Formulario de usuario */}
                <UserForm 
                    initialData={userToEdit}
                    serverId={effectiveServerId}
                    onSuccess={() => navigate('/servers')}
                    onCancel={() => navigate('/servers')}
                />
            </div>
        </div>
    );
};

export default AddServerUser;
