import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/user/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await axios.post(`${API_URL}/login`, formData);
        localStorage.setItem('token', res.data.access_token);

        // Fetch user details
        const userRes = await axios.get(`${API_URL}/user/me`, {
            headers: { Authorization: `Bearer ${res.data.access_token}` }
        });
        setUser(userRes.data);
    };

    const signup = async (name, email, password) => {
        await axios.post(`${API_URL}/register`, { name, email, password });
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
