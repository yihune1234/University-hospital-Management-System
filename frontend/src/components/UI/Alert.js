import React from 'react';
import PropTypes from 'prop-types';

function Alert({ type, message, onClose }) {
  const colorMap = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '0.25rem',
        color: '#fff',
        backgroundColor: colorMap[type] || colorMap.info,
        position: 'relative',
      }}
    >
      {message}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.25rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  type: 'info',
  onClose: null,
};

export default Alert;
