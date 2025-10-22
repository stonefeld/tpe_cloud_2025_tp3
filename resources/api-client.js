// API Configuration - Este archivo será generado por Terraform
// Si lo ejecutas localmente, usa esta configuración de desarrollo

if (typeof window.API_CONFIG === 'undefined') {
    window.API_CONFIG = {
        // Configuración por defecto para desarrollo local
        // Terraform sobreescribirá esto con la URL real del API Gateway
        apiUrl: 'http://localhost:3000', // Cambia esto si tienes un backend local
        region: 'us-east-1'
    };
}

// Helper function para hacer llamadas al API
class ApiClient {
    constructor() {
        // El apiUrl de Terraform ya incluye la URL base, pero necesitamos agregar el stage
        this.baseUrl = window.API_CONFIG.apiUrl + '/prod';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Obtener token de autenticación
        const accessToken = window.cognitoAuth ? window.cognitoAuth.getAccessToken() : null;
        
        console.log('Making API request to:', url);
        console.log('Access token available:', accessToken ? 'Yes' : 'No');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Agregar token de autorización si está disponible
        if (accessToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('Authorization header added');
        } else {
            console.warn('No access token available for request');
        }

        const config = { ...defaultOptions, ...options };

        try {
            console.log('Request config:', {
                url: url,
                method: config.method || 'GET',
                headers: config.headers
            });
            
            const response = await fetch(url, config);
            
            console.log('Response status:', response.status);
            
            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                console.log('Received 401 Unauthorized, redirecting to login...');
                // Save current URL to redirect back after login
                localStorage.setItem('redirect_after_login', window.location.href);
                // Redirect to login page
                window.location.href = 'login.html';
                return;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Productos
    async getProducts() {
        return this.request('/products');
    }

    async getProduct(productId) {
        return this.request(`/products/${productId}`);
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // Pools
    async getPools() {
        return this.request('/pools');
    }

    async getPoolDetails(poolId) {
        return this.request(`/pools/${poolId}`);
    }

    async createPool(poolData) {
        return this.request('/pools', {
            method: 'POST',
            body: JSON.stringify(poolData)
        });
    }

    // Pool Requests
    async getPoolRequests(poolId = null) {
        if (!poolId) {
            throw new Error('poolId is required to get pool requests');
        }
        return this.request(`/pools/${poolId}/requests`);
    }

    async createPoolRequest(poolId, requestData) {
        return this.request(`/pools/${poolId}/requests`, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    }
}

// Crear instancia global del cliente API
window.apiClient = new ApiClient();

// Función de debugging para verificar autenticación
window.debugAuth = function() {
    console.log('=== AUTH DEBUG ===');
    console.log('cognitoAuth available:', !!window.cognitoAuth);
    if (window.cognitoAuth) {
        console.log('isLoggedIn:', window.cognitoAuth.isLoggedIn());
        console.log('getAccessToken():', window.cognitoAuth.getAccessToken() ? 'Present' : 'Missing');
        console.log('getUser():', window.cognitoAuth.getUser());
    }
    console.log('localStorage tokens:');
    console.log('- access_token:', localStorage.getItem('cognito_access_token') ? 'Present' : 'Missing');
    console.log('- refresh_token:', localStorage.getItem('cognito_refresh_token') ? 'Present' : 'Missing');
    console.log('- timestamp:', localStorage.getItem('cognito_timestamp'));
    console.log('- expires_in:', localStorage.getItem('cognito_expires_in'));
    console.log('================');
};

// Log para debugging
console.log('API Client initialized with base URL:', window.API_CONFIG.apiUrl);
