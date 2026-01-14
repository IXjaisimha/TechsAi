import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser.role) parsedUser.role = 'user'; // Fallback
            setUser(parsedUser);
            // Basic check or just trust for now, usually would verify token
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = res.data;
            if (user.role) user.role = user.role.toLowerCase();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const signup = async (data) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', data);
            const { token, user } = res.data;
            if (user.role) user.role = user.role.toLowerCase();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
