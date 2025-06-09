import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getToken();
                
                if (currentUser && token) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const data = await authService.login(username, password);
            setUser(data.user);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const data = await authService.register(userData);
            setUser(data.user);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setLoading(false);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}; 