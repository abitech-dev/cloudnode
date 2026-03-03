import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, Terminal, User, Edit2, PlusCircle, ArrowRight } from 'lucide-react';
import '../styles/components.css';
import ServerForm from './ServerForm';

const ServerCard = ({ server, onUpdate, isNew = false, onSaveNew, onCancelNew }) => {
    const [isEditing, setIsEditing] = useState(isNew);
    const users = server.users || [];

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (isNew && onCancelNew) {
            onCancelNew();
        } else {
            setIsEditing(false);
        }
    };

    const handleSaveSuccess = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <ServerForm
                initialData={isNew ? null : server}
                isEditMode={!isNew}
                onCancel={handleCancelEdit}
                onSaveSuccess={isNew ? onSaveNew : handleSaveSuccess}
                onUpdateServer={onUpdate}
            />
        );
    }

    return (
        <div className='server-card'>
            <div className='server-card__header'>
                <h3 className='server-card__title' title={server.name}>
                    <Server className='server-card__icon' />
                    <span>{server.name}</span>
                </h3>
                <div className='server-card__actions'>
                    {/* // Boton editar servidor */}
                    <button
                        onClick={handleEditClick}
                        className='server-card__edit-btn'
                        title='Editar Detalles'
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
            </div>

            <div className='server-card__body'>
                <p className='server-card__info server-card__info--spaced'>
                    <strong>IP:</strong> {server.ip}<span className='server-card__port'><strong>Puerto:</strong> {server.port || 22}</span>
                </p>

                <div className='server-card__users-section'>
                    <div className='server-card__users-header'>
                        <h4 className='server-card__users-title'>Usuarios Disponibles</h4>
                        {/* // Boton agregar servidor */}
                        <Link to={'/servers/' + server.id + '/add-user'} className='server-card__add-user-btn'>
                            <PlusCircle size={12} className='server-card__add-user-icon' /> Nuevo
                        </Link>
                    </div>

                    <div className='server-card__users-list'>
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <div key={user.username + '-' + index} className='server-user-item'>
                                    <div className='server-user-item__info'>
                                        <User className='server-user-item__icon' />
                                        <span className='server-user-item__name' title={user.username}>{user.username}</span>
                                    </div>
                                    <div className='server-user-item__actions'>
                                        {/* // Boton editar usuario */}
                                        <Link to={`/servers/${server.id}/users/${user.id}/edit`} className='server-user-item__btn server-user-item__btn--edit' title='Editar Usuario'>
                                            <Edit2 size={14} />
                                        </Link>
                                        {/* // Boton terminal usuario */}
                                        <Link to={`/terminal/${server.id}/${user.id}`} className='server-user-item__btn server-user-item__btn--primary' title='Terminal'>
                                            <Terminal className='server-user-item__btn-icon' />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='server-card__empty-users'>
                                {/* // Estado vacío de usuarios */}
                                <Link to={'/servers/' + server.id + '/add-user'} className='btn btn--primary btn--sm server-card__empty-users-btn'>
                                    <PlusCircle size={14} className='server-card__empty-users-icon' /> Nuevo usuario
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='server-card__footer'>
                {/* // Enlace a detalles del servidor */}
                <Link to={`/servers/${server.id}`} className='server-card__link-minimal'>
                    <span>Ver Detalles</span>
                    <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
};

export default ServerCard;
