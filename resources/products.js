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

// Sample products data
let productsData = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        description: "Latest flagship smartphone with A17 Pro chip, titanium design, and advanced camera system",
        price: 1199,
        category: "electronics",
        brand: "Apple",
        stock: 50,
        image: null,
        rating: 4.8,
        reviews: 1250,
        activePools: 3
    },
    {
        id: 2,
        name: "Samsung 65\" QLED 4K TV",
        description: "Quantum dot technology, 120Hz refresh rate, smart TV with Tizen OS",
        price: 899,
        category: "electronics",
        brand: "Samsung",
        stock: 30,
        image: null,
        rating: 4.6,
        reviews: 890,
        activePools: 2
    },
    {
        id: 3,
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling wireless headphones with superior sound quality",
        price: 399,
        category: "electronics",
        brand: "Sony",
        stock: 100,
        image: null,
        rating: 4.9,
        reviews: 2340,
        activePools: 5
    },
    {
        id: 4,
        name: "Dell XPS 15",
        description: "15.6\" laptop with Intel i7, 16GB RAM, 512GB SSD, perfect for professionals",
        price: 1599,
        category: "electronics",
        brand: "Dell",
        stock: 25,
        image: null,
        rating: 4.7,
        reviews: 678,
        activePools: 1
    },
    {
        id: 5,
        name: "Dyson V15 Detect",
        description: "Cordless vacuum cleaner with laser dust detection and LCD screen",
        price: 649,
        category: "appliances",
        brand: "Dyson",
        stock: 40,
        image: null,
        rating: 4.6,
        reviews: 543,
        activePools: 2
    },
    {
        id: 6,
        name: "Nike Air Max 270",
        description: "Lifestyle sneakers with Air Max cushioning and breathable mesh upper",
        price: 150,
        category: "fashion",
        brand: "Nike",
        stock: 200,
        image: null,
        rating: 4.5,
        reviews: 1890,
        activePools: 4
    },
    {
        id: 7,
        name: "KitchenAid Stand Mixer",
        description: "5-quart tilt-head stand mixer with 10 speeds and multiple attachments",
        price: 379,
        category: "appliances",
        brand: "KitchenAid",
        stock: 60,
        image: null,
        rating: 4.8,
        reviews: 3210,
        activePools: 3
    },
    {
        id: 8,
        name: "Kindle Paperwhite",
        description: "Waterproof e-reader with 6.8\" display and adjustable warm light",
        price: 139,
        category: "electronics",
        brand: "Amazon",
        stock: 150,
        image: null,
        rating: 4.7,
        reviews: 5670,
        activePools: 6
    }
];

function initializeProducts() {
    const addProductBtn = document.getElementById('add-product-btn');
    const modal = document.getElementById('add-product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const addProductForm = document.getElementById('add-product-form');
    const productSearch = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');

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
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newProduct = {
                id: productsData.length + 1,
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: parseFloat(document.getElementById('product-price').value),
                category: document.getElementById('product-category').value,
                brand: document.getElementById('product-brand').value,
                stock: parseInt(document.getElementById('product-stock').value),
                image: null,
                rating: 0,
                reviews: 0,
                activePools: 0
            };

            productsData.push(newProduct);
            renderProducts();
            closeModal();
            
            showNotification('Product added successfully!');
        });
    }

    // Search, filter, and sort
    if (productSearch) {
        productSearch.addEventListener('input', renderProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderProducts);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', renderProducts);
    }

    // Initial render
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('products-container');
    const loading = document.getElementById('products-loading');
    const empty = document.getElementById('products-empty');
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const sortOption = document.getElementById('sort-filter').value;

    // Filter products
    let filteredProducts = productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.brand.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortOption) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            filteredProducts.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => b.id - a.id);
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
    const inStock = product.stock > 0;
    const stockStatus = product.stock > 20 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock';
    const stockColor = product.stock > 20 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600';

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <!-- Product Image Placeholder -->
            <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
            
            <div class="p-4">
                <!-- Brand -->
                <p class="text-xs text-purple-600 font-medium mb-1">${product.brand}</p>
                
                <!-- Product Name -->
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">${product.name}</h3>
                
                <!-- Rating -->
                ${product.reviews > 0 ? `
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400">
                            ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span class="text-xs text-gray-500 ml-2">(${product.reviews})</span>
                    </div>
                ` : '<div class="h-6 mb-2"></div>'}
                
                <!-- Description -->
                <p class="text-sm text-gray-500 mb-3 line-clamp-2 h-10">${product.description}</p>
                
                <!-- Price and Stock -->
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <div>
                        <span class="text-2xl font-bold text-gray-900">$${product.price.toFixed(2)}</span>
                    </div>
                    <span class="text-xs font-medium ${stockColor}">${stockStatus}</span>
                </div>
                
                <!-- Active Pools Info -->
                ${product.activePools > 0 ? `
                    <div class="bg-purple-50 rounded-lg px-3 py-2 mb-3">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Active Pools:</span>
                            <span class="font-bold text-purple-600">${product.activePools}</span>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="flex space-x-2">
                    <button onclick="viewProduct(${product.id})" class="flex-1 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Details
                    </button>
                    <button onclick="createPool(${product.id})" class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md" ${!inStock ? 'disabled class="opacity-50 cursor-not-allowed"' : ''}>
                        Create Pool
                    </button>
                </div>
            </div>
        </div>
    `;
}

function viewProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        showNotification(`Viewing ${product.name}`);
        // In a real app, navigate to product details page
    }
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
