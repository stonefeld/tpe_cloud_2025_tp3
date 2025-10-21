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
        this.baseUrl = window.API_CONFIG.apiUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
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
        const endpoint = poolId ? `/pools/${poolId}/requests` : '/requests';
        return this.request(endpoint);
    }

    async createPoolRequest(requestData) {
        return this.request('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    }
}

// Crear instancia global del cliente API
window.apiClient = new ApiClient();

// Log para debugging
console.log('API Client initialized with base URL:', window.API_CONFIG.apiUrl);
