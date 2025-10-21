// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Pools functionality
    initializePools();
});

// Pools data - will be loaded from API
let poolsData = [];

async function initializePools() {
    const createPoolBtn = document.getElementById('create-pool-btn');
    const modal = document.getElementById('create-pool-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const createPoolForm = document.getElementById('create-pool-form');
    const poolSearch = document.getElementById('pool-search');
    const poolStatusFilter = document.getElementById('pool-status-filter');

    // Set minimum date for deadline to today
    const deadlineInput = document.getElementById('pool-deadline');
    if (deadlineInput) {
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.setAttribute('min', today);
    }

    // Load pools from API
    await loadPools();

    // Modal controls
    if (createPoolBtn) {
        createPoolBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        createPoolForm.reset();
    }

    // Form submission
    if (createPoolForm) {
        createPoolForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const poolData = {
                product_id: parseInt(document.getElementById('pool-product').value), // Necesitamos un select de productos
                start_at: new Date().toISOString().split('T')[0], // Fecha actual
                end_at: document.getElementById('pool-deadline').value,
                min_quantity: parseInt(document.getElementById('pool-capacity').value)
            };

            try {
                await window.apiClient.createPool(poolData);
                await loadPools(); // Reload pools from API
                closeModal();
                showNotification('Pool created successfully! You are the first member.');
            } catch (error) {
                console.error('Error creating pool:', error);
                showNotification('Error creating pool. Please try again.');
            }
        });
    }

    // Search and filter
    if (poolSearch) {
        poolSearch.addEventListener('input', renderPools);
    }
    if (poolStatusFilter) {
        poolStatusFilter.addEventListener('change', renderPools);
    }

    // Initial render
    renderPools();
}

async function loadPools() {
    try {
        const loading = document.getElementById('pools-loading');
        if (loading) loading.classList.remove('hidden');
        
        // Obtener pools del API
        const pools = await window.apiClient.getPools();
        
        // Para cada pool, obtener los datos del producto
        const poolsWithProducts = await Promise.all(
            pools.map(async (pool) => {
                try {
                    const product = await window.apiClient.getProduct(pool.product_id);
                    return {
                        ...pool,
                        product: product
                    };
                } catch (error) {
                    console.warn(`Could not load product ${pool.product_id} for pool ${pool.id}:`, error);
                    return {
                        ...pool,
                        product: {
                            id: pool.product_id,
                            name: 'Product not found',
                            description: 'Product information unavailable',
                            unit_price: 0
                        }
                    };
                }
            })
        );
        
        poolsData = poolsWithProducts;
        
        if (loading) loading.classList.add('hidden');
        renderPools();
    } catch (error) {
        console.error('Error loading pools:', error);
        const loading = document.getElementById('pools-loading');
        if (loading) loading.classList.add('hidden');
        showNotification('Error loading pools. Please refresh the page.');
    }
}

function renderPools() {
    const container = document.getElementById('pools-container');
    const loading = document.getElementById('pools-loading');
    const empty = document.getElementById('pools-empty');
    const searchTerm = document.getElementById('pool-search').value.toLowerCase();
    const statusFilter = document.getElementById('pool-status-filter').value;

    // Filter pools
    let filteredPools = poolsData.filter(pool => {
        const matchesSearch = (pool.product?.name || '').toLowerCase().includes(searchTerm) || 
                            (pool.product?.description || '').toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || pool.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filteredPools.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    container.innerHTML = filteredPools.map(pool => createPoolCard(pool)).join('');
}

function createPoolCard(pool) {
    // Mapear campos de la base de datos a campos del frontend
    const joined = pool.joined || 0; // Este campo no existe en la DB, lo calcularemos
    const capacity = pool.min_quantity || 1;
    const joinedPercent = Math.round((joined / capacity) * 100);
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        closed: 'bg-purple-100 text-purple-800',
        completed: 'bg-gray-100 text-gray-800'
    };

    // Usar unit_price del producto en lugar de price
    const price = pool.product?.unit_price || pool.unit_price || 0;
    const discountedPrice = price; // Por ahora sin descuento
    const totalSavings = 0; // Por ahora sin ahorros calculados
    const isPoolFull = joined >= capacity;
    const isClosed = false; // Por ahora siempre activo

    // Calculate days remaining usando end_at
    const today = new Date();
    const deadline = new Date(pool.end_at);
    const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining < 0;

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${pool.product?.name || 'Product'}</h3>
                    <p class="text-sm text-gray-500">${pool.product?.description || 'Pool description'}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} capitalize ml-2">
                    ${isExpired ? 'Expired' : 'Active'}
                </span>
            </div>
            
            <div class="mb-4 bg-purple-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <div>
                        <span class="text-2xl font-bold text-gray-900">$${price.toFixed(2)}</span>
                        <span class="text-sm text-gray-500 ml-2">per unit</span>
                    </div>
                    <span class="text-green-600 font-bold text-lg">Bulk Order</span>
                </div>
                <p class="text-xs text-gray-600">Minimum quantity: ${capacity} units</p>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Participants</span>
                    <span class="font-medium">${joined}/${capacity} (${joinedPercent}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all" style="width: ${joinedPercent}%"></div>
                </div>
            </div>
            
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="${isExpired ? 'text-red-600 font-medium' : ''}">${isExpired ? 'Expired' : `${daysRemaining} days left`}</span>
                </div>
                <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>${joined} joined</span>
                </div>
            </div>
            
            <div class="flex space-x-2">
                ${!isClosed && !isPoolFull && !isExpired ? `
                    <button onclick="joinPool(${pool.id})" class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
                        Join Pool
                    </button>
                ` : `
                    <button disabled class="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        ${isPoolFull ? 'Pool Full' : isExpired ? 'Expired' : 'Closed'}
                    </button>
                `}
                <button onclick="viewPoolDetails(${pool.id})" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
        </div>
    `;
}

async function joinPool(poolId) {
    try {
        const pool = poolsData.find(p => p.id === poolId);
        if (pool && !isExpired(pool.end_at)) {
            // Create a pool request to join the pool
            const requestData = {
                email: 'user@example.com', // En una app real, esto vendría del login
                quantity: 1
            };
            
            await window.apiClient.createPoolRequest(poolId, requestData);
            await loadPools(); // Reload pools from API
            showNotification(`Successfully joined pool!`);
        }
    } catch (error) {
        console.error('Error joining pool:', error);
        showNotification('Error joining pool. Please try again.');
    }
}

function isExpired(endDate) {
    const today = new Date();
    const deadline = new Date(endDate);
    return deadline < today;
}

function viewPoolDetails(poolId) {
    const pool = poolsData.find(p => p.id === poolId);
    if (pool) {
        showNotification(`Viewing details for: ${pool.product?.name || 'Pool'}`);
        // In a real app, this would navigate to a details page or open a modal
    }
}

function showNotification(message) {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
