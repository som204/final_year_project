import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'; 


export const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = Cookies.get('authToken');
        const storedUser = Cookies.get('authUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }else{
            setIsLoading(false);
        }
    }, []);

    // Function to handle user login
    const login = (userData, authToken) => {
        Cookies.set('authUser', JSON.stringify(userData), { expires: 7 });
        Cookies.set('authToken', authToken, { expires: 7 });
        setUser(userData);
        setToken(authToken);
        setIsLoading(true);
    };

    // Function to handle user logout
    const logout = async () => {
        try {
            const res= await fetch('http://localhost:8000/user/logout', { method: 'GET', credentials: 'include' });
            if(res.ok){
                Cookies.remove('authUser');
                Cookies.remove('authToken');
                setUser(null);
                setToken(null);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // The value provided to consuming components
    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading, 
        login,
        logout,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
