import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign In</h2>

                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary mt-2">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Don't have an account? <Link to="/signup" className="text-primary font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
