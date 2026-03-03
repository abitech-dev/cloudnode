import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import { Hash, Globe, Check, X } from 'lucide-react';
import '../styles/components.css';

const ServerForm = ({ initialData, isEditMode = false, onCancel, onSaveSuccess, onUpdateServer }) => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // Custom hook personalizado
    const { addServer, updateServer, loading } = useServers();
    
    // Datos iniciales
    const [serverData, setServerData] = useState({
        name: '',
        ip: '',
        port: 22
    });

    // Actualizar servidor
    const performUpdate = async (id, data) => {
        if (onUpdateServer) {
            return await onUpdateServer(id, data);
        }
        return await updateServer(id, data);
    };

    // Cargar datos iniciales modo edición
    useEffect(() => {
        if (isEditMode && initialData) {
            setServerData({
                name: initialData.name || '',
                ip: initialData.ip || '',
                port: initialData.port || 22
            });
        }
    }, [isEditMode, initialData]);

    // Cambios en el formulario
    const handleServerChange = (e) => {
        const { name, value } = e.target;
        setServerData(prev => ({ ...prev, [name]: value }));
    };

    // Crear servidor
    const performAdd = async (data) => {
        if (onSaveSuccess && onSaveSuccess.length > 0) {
             return await onSaveSuccess(data);
        } else {
             const result = await addServer(data);
             if (onSaveSuccess) onSaveSuccess();
             else navigate('/servers');
             return result;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isEditMode && initialData?.id) {
                // Llama actualizar servidor
                await performUpdate(initialData.id, serverData);
                if (onSaveSuccess) onSaveSuccess();
            } else if (isEditMode && !initialData?.id) {
                setError("Error: No se proporcionó ID de servidor.");
            } else {
                // Llama crear servidor
                await performAdd(serverData);
            }
        } catch (err) {
            console.error("Error al guardar el servidor", err);
            const errorMessage = err.response?.data?.detail || err.message;
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="server-card server-card--editing">
            <form onSubmit={handleSubmit} className="server-form__container" autoComplete="off">
                <div className="server-card__header server-form__header">
                    <div className="server-form__field-group">
                        <label className="server-form__label">Nombre del servidor</label>
                        <input 
                            type="text"
                            name="name" 
                            value={serverData.name}
                            onChange={handleServerChange}
                            className="form__input server-form__input-name"
                            placeholder="Mi Servidor PRD"
                            autoFocus
                            required
                        />
                    </div>
                </div>
                
                <div className="server-card__body">
                    <div className="server-form__row">
                        <div className="server-form__col-ip">
                            <label className="server-form__label">Dirección IP</label>
                            <div className="server-form__input-wrapper">
                                <Globe size={14} className="server-form__input-icon" />
                                <input 
                                    type="text"
                                    name="ip"
                                    value={serverData.ip}
                                    onChange={handleServerChange}
                                    className="form__input server-form__input-with-icon"
                                    placeholder="192.168.1.10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="server-form__col-port">
                            <label className="server-form__label">Puerto</label>
                            <div className="server-form__input-wrapper">
                                <Hash size={14} className="server-form__input-icon" />
                                <input 
                                    type="number"
                                    name="port"
                                    value={serverData.port}
                                    onChange={handleServerChange}
                                    className="form__input server-form__input-with-icon"
                                    placeholder="22"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="server-card__actions server-form__actions">
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className="btn btn--secondary server-form__btn"
                        >
                            <X size={16} className="server-form__btn-icon" /> Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn--primary server-form__btn"
                            disabled={loading}
                        >
                           <Check size={16} className="server-form__btn-icon" /> {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                    {error && <div className="error-text server-form__error">{error}</div>}
                </div>
            </form>
        </div>
    );
};

export default ServerForm;
