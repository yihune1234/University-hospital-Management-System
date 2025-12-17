import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatCard - Dashboard statistics card component
 * Displays a statistic with icon, value, label, and optional trend
 */
function StatCard({ icon, value, label, trend, gradientFrom, gradientTo, onClick }) {
    const style = {
        '--gradient-from': gradientFrom,
        '--gradient-to': gradientTo,
    };

    return (
        <div
            className="stat-card"
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {icon && <div className="stat-card-icon">{icon}</div>}
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
            {trend && (
                <div className="stat-card-trend" style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
                    {trend}
                </div>
            )}
        </div>
    );
}

StatCard.propTypes = {
    icon: PropTypes.node,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    trend: PropTypes.node,
    gradientFrom: PropTypes.string.isRequired,
    gradientTo: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

StatCard.defaultProps = {
    icon: null,
    trend: null,
    onClick: null,
};

export default StatCard;
