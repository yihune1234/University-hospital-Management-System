import React from 'react';
import PropTypes from 'prop-types';

function Input({
  id,
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur = undefined,
  placeholder = '',
  required = false,
  minLength = undefined,
  maxLength = undefined,
  pattern = undefined,
  error = '',
  disabled = false,
  autoComplete = 'off',
}) {
  return (
    <div className="input-group" style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}
      >
        {label}
        {' '}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '0.25rem',
          border: error ? '2px solid #dc3545' : '1px solid #ced4da',
          outline: 'none',
          fontSize: '1rem',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            color: '#dc3545',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            display: 'block',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export default Input;
