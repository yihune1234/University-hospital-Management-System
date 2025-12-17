import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * DataTable - Reusable data table component with search, sort, and pagination
 */
function DataTable({ columns, data, searchable, searchPlaceholder, onRowClick, emptyMessage }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchable || !searchTerm) return data;

        return data.filter((row) =>
            columns.some((col) => {
                const value = col.accessor ? row[col.accessor] : '';
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            }),
        );
    }, [data, searchTerm, columns, searchable]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (accessor) => {
        if (sortColumn === accessor) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(accessor);
            setSortDirection('asc');
        }
    };

    return (
        <div className="table-container">
            {searchable && (
                <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-gray-200)' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder={searchPlaceholder || 'Search...'}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {paginatedData.length === 0 ? (
                <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    {emptyMessage || 'No data available'}
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.accessor || col.header}
                                            onClick={() => col.sortable && handleSort(col.accessor)}
                                            style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.header}
                                                {col.sortable && sortColumn === col.accessor && (
                                                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((row, rowIndex) => (
                                    <tr
                                        key={row.id || rowIndex}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.accessor || col.header}>
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div
                            className="flex items-center justify-between"
                            style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--color-gray-200)' }}
                        >
                            <div className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

DataTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            header: PropTypes.string.isRequired,
            accessor: PropTypes.string,
            sortable: PropTypes.bool,
            render: PropTypes.func,
        }),
    ).isRequired,
    data: PropTypes.array.isRequired,
    searchable: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    onRowClick: PropTypes.func,
    emptyMessage: PropTypes.string,
};

DataTable.defaultProps = {
    searchable: false,
    searchPlaceholder: 'Search...',
    onRowClick: null,
    emptyMessage: 'No data available',
};

export default DataTable;
