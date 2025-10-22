// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Products functionality
    initializeProducts();
});

// Products data - will be loaded from API
let productsData = [];

async function initializeProducts() {
    const addProductBtn = document.getElementById('add-product-btn');
    const modal = document.getElementById('add-product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const addProductForm = document.getElementById('add-product-form');
    const productSearch = document.getElementById('product-search');
    const sortFilter = document.getElementById('sort-filter');

    // Load products from API
    await loadProducts();

    // Modal controls
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
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
        addProductForm.reset();
    }

    // Form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                unit_price: parseFloat(document.getElementById('product-price').value)
            };

            try {
                await window.apiClient.createProduct(productData);
                await loadProducts(); // Reload products from API
                closeModal();
                showNotification('Product added successfully!');
            } catch (error) {
                console.error('Error creating product:', error);
                showNotification('Error creating product. Please try again.');
            }
        });
    }

    // Search, filter, and sort
    if (productSearch) {
        productSearch.addEventListener('input', renderProducts);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', renderProducts);
    }

    // Initial render
    renderProducts();
}

async function loadProducts() {
    try {
        const loading = document.getElementById('products-loading');
        if (loading) loading.classList.remove('hidden');
        
        productsData = await window.apiClient.getProducts();
        
        if (loading) loading.classList.add('hidden');
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        const loading = document.getElementById('products-loading');
        if (loading) loading.classList.add('hidden');
        showNotification('Error loading products. Please refresh the page.');
    }
}

function renderProducts() {
    const container = document.getElementById('products-container');
    const loading = document.getElementById('products-loading');
    const empty = document.getElementById('products-empty');
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const sortOption = document.getElementById('sort-filter').value;

    // Filter products
    let filteredProducts = productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        return matchesSearch;
    });

    // Sort products
    switch (sortOption) {
        case 'price-low':
            filteredProducts.sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => (b.unit_price || 0) - (a.unit_price || 0));
            break;
        default:
            // no default sorting
            break;
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <!-- Product Image Placeholder -->
            <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
            
            <div class="p-4">
                <!-- Product Name -->
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">${product.name}</h3>
                
                <!-- Description -->
                <p class="text-sm text-gray-500 mb-3 line-clamp-2 h-10">${product.description || 'No description available'}</p>
                
                <!-- Price -->
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <div>
                        <span class="text-2xl font-bold text-gray-900">$${product.unit_price.toFixed(2)}</span>
                        <span class="text-sm text-gray-500 ml-2">per unit</span>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="flex space-x-2 w-full">
                    <button onclick="createPool(${product.id})" class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
                        Create Pool
                    </button>
                </div>
            </div>
        </div>
    `;
}

function viewProduct(productId) {
    // Removed: product details view is not implemented
}

function createPool(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        showNotification(`Creating pool for ${product.name}`);
        // In a real app, navigate to create pool page with pre-filled product info
        setTimeout(() => {
            window.location.href = 'pools.html';
        }, 1000);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
