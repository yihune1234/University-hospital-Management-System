import React from 'react';
import { render, screen } from '@testing-library/react';
import Table from '../components/UI/Table';

describe('Table component', () => {
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
  ];

  const data = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  test('renders table headers', () => {
    render(<Table headers={headers} data={data} keyField="id" />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('renders table rows and cells', () => {
    render(<Table headers={headers} data={data} keyField="id" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('renders custom row with renderRow prop', () => {
    const renderRow = (row) => (
      <tr key={row.id}>
        <td>{row.id}</td>
        <td>{row.name.toUpperCase()}</td>
      </tr>
    );
    render(
      <Table
        headers={headers}
        data={data}
        keyField="id"
        renderRow={renderRow}
      />,
    );
    expect(screen.getByText('ALICE')).toBeInTheDocument();
    expect(screen.getByText('BOB')).toBeInTheDocument();
  });

  test('shows message when no headers provided', () => {
    render(<Table headers={[]} data={data} keyField="id" />);
    expect(screen.getByText(/no headers provided/i)).toBeInTheDocument();
  });

  test('shows message when no data provided', () => {
    render(<Table headers={headers} data={[]} keyField="id" />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
});
