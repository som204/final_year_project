import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUnreadCount } from '../api/notification';
import { UserContext } from './user.context';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useContext(UserContext);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!isAuthenticated) return;
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    // Fetch when authenticated state changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [isAuthenticated, user]);

    // Mechanism to periodically poll or just update manually
    // For now, providing the refresh function lets us update it on demand
    const refreshUnreadCount = () => {
        fetchUnreadCount();
    };

    const value = {
        unreadCount,
        refreshUnreadCount,
        setUnreadCount, // optionally allow manual override
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
