import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/components.css';

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    if (!isOpen) return null;

    // Cerrar modal al hacer clic fuera
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    };

    return createPortal(
        <div className="confirm-modal" onClick={handleBackdropClick}>
            <div className="confirm-modal__backdrop" />
            <div className="confirm-modal__panel" role="dialog" aria-modal="true">
                <h3 className="confirm-modal__title">{title}</h3>
                <p className="confirm-modal__message">{message}</p>
                <div className="confirm-modal__actions">
                    {/* // Botones de cancelar */}
                    <button
                        type="button"
                        className="confirm-modal__btn confirm-modal__btn--ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>

                    {/* // Botón de confirmar */}
                    <button
                        type="button"
                        className="confirm-modal__btn confirm-modal__btn--danger"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
