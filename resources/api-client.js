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
        
        // Debug: verificar tokens
        if (window.cognitoAuth) {
            window.cognitoAuth.debugTokens();
        }
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Agregar token de autorización si está disponible
        if (accessToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('Token incluido en la petición');
        } else {
            console.log('No hay token disponible');
        }

        const config = { ...defaultOptions, ...options };

        try {
            console.log('Haciendo petición a:', url);
            console.log('Headers:', config.headers);
            
            const response = await fetch(url, config);
            
            console.log('Respuesta recibida:', response.status, response.statusText);
            
            // Si recibimos 401, el token puede haber expirado
            if (response.status === 401 && window.cognitoAuth) {
                console.log('Token expirado, intentando renovar...');
                const refreshed = await window.cognitoAuth.refreshToken();
                if (refreshed) {
                    // Reintentar la petición con el nuevo token
                    const newToken = window.cognitoAuth.getAccessToken();
                    if (newToken) {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                        const retryResponse = await fetch(url, config);
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }
                        return await retryResponse.json();
                    }
                }
                // Si no se pudo renovar, redirigir a login
                window.location.href = 'login.html';
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
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

// Log para debugging
console.log('API Client initialized with base URL:', window.API_CONFIG.apiUrl);
