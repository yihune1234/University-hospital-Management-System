import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * FormModal - Modal dialog for forms
 * Provides backdrop, close button, and form layout
 */
function FormModal({ isOpen, onClose, title, children, size }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalStyle = {
        maxWidth: size === 'sm' ? '400px' : size === 'lg' ? '800px' : '600px',
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

FormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

FormModal.defaultProps = {
    size: 'md',
};

export default FormModal;
