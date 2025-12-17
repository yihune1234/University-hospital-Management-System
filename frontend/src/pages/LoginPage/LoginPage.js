import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/UI/Input';
import Form from '../../components/UI/Form';
import Alert from '../../components/UI/Alert';
import { isValidEmail } from '../../utils/validation';
import { AuthContext } from '../../context/AuthContext';

import './LoginPage.css';

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setApiError(result.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container" role="main">
      <h1 className="login-title">
        University Integrated Clinic Management System
      </h1>
      <Form onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert
            type="error"
            message={apiError}
            onClose={() => setApiError('')}
          />
        )}
        <Input
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={formErrors.email}
          autoComplete="email"
          placeholder="your.email@university.edu"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={formErrors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
          }}
          aria-busy={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </Form>
    </div>
  );
}

export default LoginPage;
