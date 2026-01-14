import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const Landing = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        if (user.role && user.role.toLowerCase() === 'admin') {
            return <Navigate to="/company/dashboard" />;
        } else {
            return <Navigate to="/dashboard" />;
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="max-w-4xl text-center">
                <h1 className="text-5xl font-bold text-slate-900 mb-6">
                    AI-Powered <span className="text-primary">Resume Screening</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                    Connect with top talent or find your dream job instantly.
                    Our advanced AI matches skills to requirements with 95% accuracy.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
                        Sign In
                    </Link>
                    <Link to="/signup" className="btn btn-outline text-lg px-8 py-3 bg-white">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
