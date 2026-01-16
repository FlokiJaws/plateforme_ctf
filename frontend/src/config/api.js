// Configuration API centralisée
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
};

// Helper pour construire les URLs
export const buildApiUrl = (endpoint) => {
    // Enlever le / au début si présent
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

export default API_CONFIG;
