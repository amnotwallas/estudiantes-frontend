const API_URL = 'http://localhost:3000/api';

export const authService = {
    async login(username, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el inicio de sesión');
        }

        // Guardar usuario y token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        return data;
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }

        // También guardamos usuario y token tras registro
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        return data;
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    // Peticiones autenticadas
    async authFetch(url, options = {}) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
            throw new Error(error.message || 'Error en la petición');
        }

        return response;
    }
};
