// src/config/api.js
import { API_CONFIG } from './config';

export const registerUser = async (email, password, company) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGNUP}`;
    console.log('Registering user with URL:', url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, company }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
    console.log('Logging in user with URL:', url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw error;
    }
};

// Similar updates for githubAuth and googleAuth functions