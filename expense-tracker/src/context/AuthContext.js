import React, { createContext, useState, useEffect } from 'react';
import { login, register, getProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in on page load
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getProfile(token);
                setCurrentUser(userData);
                setError(null);
            } catch (err) {
                console.error('Error verifying token:', err);
                localStorage.removeItem('token');
                setToken(null);
                setCurrentUser(null);
                setError('Session expired. Please login again.');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const loginUser = async (email, password) => {
        try {
            setLoading(true);
            const { token, user } = await login(email, password);
            localStorage.setItem('token', token);
            setToken(token);
            setCurrentUser(user);
            setError(null);
            return user;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (name, email, password) => {
        try {
            setLoading(true);
            const { token, user } = await register(name, email, password);
            localStorage.setItem('token', token);
            setToken(token);
            setCurrentUser(user);
            setError(null);
            return user;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to register');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
    };

    const updateUserContext = (userData) => {
        setCurrentUser(userData);
    };

    const value = {
        currentUser,
        token,
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        updateUserContext
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};