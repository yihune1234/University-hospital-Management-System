import React from 'react';
import {
  render, waitFor, act,
} from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import api from '../utils/api';

jest.mock('../utils/api');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('loads user on mount if token exists', async () => {
    localStorage.setItem('authToken', 'test-token');
    api.get.mockResolvedValueOnce({
      data: { user: { id: '1', email: 'test@example.com', role: 'admin' } },
    });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    expect(contextValue.loading).toBe(true);

    await waitFor(() => expect(contextValue.loading).toBe(false));
    expect(contextValue.user).toMatchObject({
      email: 'test@example.com',
      role: 'admin',
    });
  });

  test('login success stores token and sets user', async () => {
    const fakeUser = { id: '1', email: 'user@example.com', role: 'nurse' };
    const fakeToken = 'fake-token';

    api.post.mockResolvedValueOnce({
      data: { token: fakeToken, user: fakeUser },
    });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    await act(async () => {
      const result = await contextValue.login({
        email: 'user@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });

    expect(localStorage.getItem('authToken')).toBe(fakeToken);
    expect(contextValue.user).toMatchObject(fakeUser);
  });

  test('login failure returns error message', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    let result;
    await act(async () => {
      result = await contextValue.login({
        email: 'bad@example.com',
        password: 'wrong',
      });
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  test('logout clears user and token', () => {
    localStorage.setItem('authToken', 'some-token');
    let contextValue;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );

    act(() => {
      contextValue.logout();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(contextValue.user).toBeNull();
  });
});
