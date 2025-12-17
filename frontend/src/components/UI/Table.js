import React from 'react';
import PropTypes from 'prop-types';

function Table({
  headers, data, keyField, renderRow,
}) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return <p>No headers provided</p>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <p>No data available</p>;
  }

  return (
    <table
      role="table"
      aria-label="Data Table"
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        marginBottom: '1rem',
      }}
    >
      <thead>
        <tr>
          {headers.map(({ key, label }) => (
            <th
              key={key}
              scope="col"
              style={{
                borderBottom: '2px solid #dee2e6',
                textAlign: 'left',
                padding: '0.75rem',
              }}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const rowKey = row[keyField] || JSON.stringify(row);
          return renderRow ? (
            renderRow(row, rowKey)
          ) : (
            <tr key={rowKey}>
              {headers.map(({ key }) => (
                <td
                  key={key}
                  style={{
                    borderBottom: '1px solid #dee2e6',
                    padding: '0.75rem',
                  }}
                >
                  {row[key] !== undefined && row[key] !== null
                    ? row[key].toString()
                    : ''}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  keyField: PropTypes.string.isRequired,
  renderRow: PropTypes.func,
};

Table.defaultProps = {
  renderRow: null,
};

export default Table;
