import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'user', company_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signup(formData);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Create Account</h2>

                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-4 mb-2 justify-center">
                        <button
                            type="button"
                            className={`btn ${formData.role === 'user' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFormData({ ...formData, role: 'user' })}
                            style={{ flex: 1 }}
                        >
                            Job Seeker
                        </button>
                        <button
                            type="button"
                            className={`btn ${formData.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                            style={{ flex: 1 }}
                        >
                            Company
                        </button>
                    </div>

                    <div>
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {formData.role === 'admin' && (
                        <div>
                            <label>Company Name</label>
                            <input
                                type="text"
                                required
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                    )}

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
                        {loading ? 'Create Account' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Already have an account? <Link to="/login" className="text-primary font-medium">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
