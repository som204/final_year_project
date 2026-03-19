import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/notification`;

// Helper to configure fetch options with credentials since JWT is in cookies
const getFetchOptions = (method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include" // send cookies
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    return options;
};

// Helper to handle API responses and errors
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (err) {
            // ignore if response is not JSON
        }
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

export const createNotification = async (data) => {
    const response = await fetch(`${BASE_URL}/create`, getFetchOptions("POST", data));
    return handleResponse(response);
};

export const getNotifications = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${BASE_URL}/all?${queryString}` : `${BASE_URL}/all`;
    const response = await fetch(url, getFetchOptions("GET"));
    return handleResponse(response);
};

export const getUnreadCount = async () => {
    const response = await fetch(`${BASE_URL}/unread-count`, getFetchOptions("GET"));
    return handleResponse(response); // expected to have { unread_count: number }
};

export const getNotificationById = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, getFetchOptions("GET"));
    return handleResponse(response);
};

export const updateNotification = async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, getFetchOptions("PUT", data));
    return handleResponse(response);
};

export const deleteNotification = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, getFetchOptions("DELETE"));
    return handleResponse(response);
};

export const markAsRead = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/read`, getFetchOptions("PATCH", {}));
    return handleResponse(response);
};

export const markAllAsRead = async () => {
    const response = await fetch(`${BASE_URL}/read-all`, getFetchOptions("PATCH", {}));
    return handleResponse(response);
};
