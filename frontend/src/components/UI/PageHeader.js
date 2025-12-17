import React from 'react';
import PropTypes from 'prop-types';

/**
 * PageHeader - Reusable page header component
 * Displays page title, description, and action buttons
 */
function PageHeader({ title, description, actions, breadcrumbs }) {
    return (
        <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
            {breadcrumbs && (
                <div className="breadcrumbs" style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                    {breadcrumbs}
                </div>
            )}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--space-xs)' }}>{title}</h1>
                    {description && <p className="text-gray-600" style={{ marginBottom: 0 }}>{description}</p>}
                </div>
                {actions && (
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    actions: PropTypes.node,
    breadcrumbs: PropTypes.node,
};

PageHeader.defaultProps = {
    description: null,
    actions: null,
    breadcrumbs: null,
};

export default PageHeader;
