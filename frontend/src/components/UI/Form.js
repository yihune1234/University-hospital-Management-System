import React from 'react';
import PropTypes from 'prop-types';

function Form({
  onSubmit,
  children,
  className = '',
  noValidate = false,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={className}
      noValidate={noValidate}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {children}
    </form>
  );
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  noValidate: PropTypes.bool,
};

export default Form;
