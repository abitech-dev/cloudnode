import React, { useState, useEffect } from 'react';
import { User, Key, Lock, Check, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useServers } from '../hooks/useServers';
import ConfirmModal from './ConfirmModal';

const UserForm = ({ initialData, serverId, onSuccess, onCancel }) => {
    const { addServerUser, updateServerUser, deleteServerUser } = useServers();
    const [userData, setUserData] = useState({
        username: '',
        auth_type: 'password', // 'password' or 'key'
        password: '',
        private_key: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!initialData?.id;

    useEffect(() => {
        if (initialData) {
            setUserData({
                username: initialData.username || '',
                auth_type: initialData.auth_type || 'password',
                // Don't populate sensitive fields like password/private_key if not needed or unavailable
                // But for edit, maybe we want to allow updating them.
                password: '', 
                private_key: ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
        setValidationError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(null);
        setIsSaving(true);

        // Basic validation
        if (!userData.username.trim()) {
            setValidationError('El nombre de usuario es obligatorio');
            return;
        }
        if (userData.auth_type === 'password' && !isEditMode && !userData.password) {
             setValidationError('La contraseña es obligatoria para nuevos usuarios');
             return;
        }
        if (userData.auth_type === 'key' && !isEditMode && !userData.private_key) {
             setValidationError('La clave privada es obligatoria para nuevos usuarios');
             return;
        }

        try {
            // Prepare data to send, mapping frontend fields to backend expected fields
            const dataToSend = {
                username: userData.username,
                auth_type: userData.auth_type,
            };

            if (userData.auth_type === 'password' && userData.password) {
                dataToSend.password_encrypted = userData.password;
            } else if (userData.auth_type === 'key' && userData.private_key) {
                dataToSend.private_key_encrypted = userData.private_key;
            }

            if (isEditMode) {
                await updateServerUser(initialData.id, dataToSend);
            } else {
                await addServerUser(serverId, dataToSend);
            }
            
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error al guardar usuario", err);
            setValidationError(err.response?.data?.detail || err.message || "Error al guardar usuario");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDelete = () => {
        setIsConfirmOpen(true);
    };

    const handleCloseDelete = () => {
        if (!isDeleting) {
            setIsConfirmOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!isEditMode) return;
        setIsDeleting(true);
        try {
            await deleteServerUser(initialData.id);
            if (onSuccess) onSuccess();
        } catch (err) {
            setValidationError(err.response?.data?.detail || err.message || 'Error eliminando usuario');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    return (
        <div className="server-card server-card--editing">
            <div className="server-card__header">
                <h3 className="server-card__title">
                    <User className="server-card__icon" />
                    {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="server-form" autoComplete="off">
                {validationError && (
                    <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.875rem' }}>
                        {validationError}
                    </div>
                )}

                <div className="form__group">
                    <label className="form__label">Usuario</label>
                    <div className="form__input-wrapper">
                        <User className="form__input-icon" size={18} />
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            className="form__input"
                            placeholder="root"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="form__group">
                    <label className="form__label">Autenticación</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label className={`radio-card ${userData.auth_type === 'password' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="auth_type"
                                value="password"
                                checked={userData.auth_type === 'password'}
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                            <Lock size={18} />
                            <span>Contraseña</span>
                        </label>
                        <label className={`radio-card ${userData.auth_type === 'key' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="auth_type"
                                value="key"
                                checked={userData.auth_type === 'key'}
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                            <Key size={18} />
                            <span>Llave SSH</span>
                        </label>
                    </div>
                </div>

                {userData.auth_type === 'password' ? (
                    <div className="form__group">
                        <label className="form__label">
                            Contraseña
                            {isEditMode && (
                                <span className="form__label-note">(Dejar vacío para mantener actual)</span>
                            )}
                        </label>
                        <div className="form__input-wrapper">
                            <Lock className="form__input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                className="form__input"
                                placeholder={isEditMode ? "••••••••" : "Ingresar contraseña"}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="btn-icon-only"
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="form__group">
                        <label className="form__label">
                            Clave Privada
                            {isEditMode && (
                                <span className="form__label-note">(Dejar vacío para mantener actual)</span>
                            )}
                        </label>
                        <div className="form__input-wrapper form__input-wrapper--textarea">
                            <Key className="form__input-icon" size={18} style={{ marginTop: '0.75rem' }} />
                            <textarea
                                name="private_key"
                                value={userData.private_key}
                                onChange={handleChange}
                                className="form__input form__textarea"
                                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                                rows={5}
                                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                )}

                <div className={`user-form__actions${isEditMode ? '' : ' user-form__actions--single'}`}>
                    {isEditMode && (
                        <div className="user-form__actions-left">
                            <button type="button" onClick={handleOpenDelete} className="btn btn--danger">
                                <Trash2 size={16} className="btn__icon" /> Eliminar
                            </button>
                        </div>
                    )}
                    <div className="user-form__actions-right">
                        <button type="button" onClick={onCancel} className="btn btn--secondary">
                            <X size={16} className="btn__icon" /> Cancelar
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={isSaving}>
                            <Check size={16} className="btn__icon" />
                            {isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Agregar')}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar usuario"
                message="Vas a eliminar este usuario. Esta accion no se puede deshacer."
                confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseDelete}
                isLoading={isDeleting}
            />
            
            <style>{`
                .radio-card {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                    flex: 1;
                    justify-content: center;
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .radio-card.active {
                    background-color: rgba(37, 99, 235, 0.05); /* var(--primary-color) with opacity */
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
                .radio-card:hover:not(.active) {
                    background-color: var(--bg-secondary);
                }
                .form__input-wrapper {
                    position: relative;
                }
                .form__input-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    pointer-events: none;
                }
                .form__input {
                    padding-left: 2.5rem !important;
                }
                .form__textarea {
                    padding-top: 0.75rem !important;
                }
            `}</style>
        </div>
    );
};

export default UserForm;
