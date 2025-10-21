// Sample requests data
const requestsData = [
    {
        id: 1,
        poolName: 'iPhone 15 Pro Group Buy',
        productName: 'iPhone 15 Pro 256GB',
        quantity: 1,
        price: 899.99,
        originalPrice: 999.99,
        savings: 100.00,
        status: 'delivered',
        requestDate: '2025-09-15',
        confirmedDate: '2025-09-16',
        shippedDate: '2025-09-20',
        deliveredDate: '2025-09-25',
        trackingNumber: 'TRK123456789',
        poolId: 1
    },
    {
        id: 2,
        poolName: '4K Smart TV Bulk Order',
        productName: 'Samsung 55" 4K Smart TV',
        quantity: 1,
        price: 449.99,
        originalPrice: 599.99,
        savings: 150.00,
        status: 'shipped',
        requestDate: '2025-10-01',
        confirmedDate: '2025-10-02',
        shippedDate: '2025-10-15',
        trackingNumber: 'TRK987654321',
        poolId: 2,
        estimatedDelivery: '2025-10-25'
    },
    {
        id: 3,
        poolName: 'Premium Headphones Deal',
        productName: 'Sony WH-1000XM5',
        quantity: 1,
        price: 279.99,
        originalPrice: 349.99,
        savings: 70.00,
        status: 'confirmed',
        requestDate: '2025-10-10',
        confirmedDate: '2025-10-12',
        poolId: 3,
        estimatedShipping: '2025-10-22'
    },
    {
        id: 4,
        poolName: 'Gaming Laptop Pool',
        productName: 'ASUS ROG Laptop',
        quantity: 1,
        price: 1199.99,
        originalPrice: 1499.99,
        savings: 300.00,
        status: 'pending',
        requestDate: '2025-10-18',
        poolId: 4
    },
    {
        id: 5,
        poolName: 'Mechanical Keyboard Bundle',
        productName: 'Logitech MX Mechanical',
        quantity: 1,
        price: 119.99,
        originalPrice: 169.99,
        savings: 50.00,
        status: 'cancelled',
        requestDate: '2025-10-05',
        cancelledDate: '2025-10-07',
        cancelReason: 'Pool did not meet minimum participants',
        poolId: 5
    }
];

let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderRequests();
    updateStats();
    setupMobileMenu();
});

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function filterRequests(status) {
    currentFilter = status;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
    });
    
    event.target.classList.add('active', 'bg-purple-600', 'text-white');
    event.target.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
    
    renderRequests();
}

function renderRequests() {
    const container = document.getElementById('requests-container');
    const emptyState = document.getElementById('empty-state');
    
    let filteredRequests = requestsData;
    if (currentFilter !== 'all') {
        filteredRequests = requestsData.filter(req => req.status === currentFilter);
    }
    
    if (filteredRequests.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = filteredRequests.map(request => createRequestCard(request)).join('');
}

function createRequestCard(request) {
    const statusConfig = {
        pending: {
            color: 'purple',
            icon: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
            text: 'Waiting for pool to complete'
        },
        confirmed: {
            color: 'green',
            icon: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
            text: 'Order confirmed, preparing shipment'
        },
        shipped: {
            color: 'blue',
            icon: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>`,
            text: 'Package shipped, on the way'
        },
        delivered: {
            color: 'green',
            icon: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>`,
            text: 'Successfully delivered'
        },
        cancelled: {
            color: 'red',
            icon: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>`,
            text: 'Request cancelled'
        }
    };

    const config = statusConfig[request.status];
    const discountPercent = Math.round((request.savings / request.originalPrice) * 100);

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <!-- Left: Product Info -->
                <div class="flex-1">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-900 mb-1">${request.productName}</h3>
                            <p class="text-sm text-gray-500">Pool: ${request.poolName}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 capitalize ml-2">
                            ${request.status}
                        </span>
                    </div>

                    <!-- Status Info -->
                    <div class="flex items-center space-x-2 mb-4 text-${config.color}-600">
                        ${config.icon}
                        <span class="text-sm font-medium">${config.text}</span>
                    </div>

                    <!-- Timeline -->
                    <div class="flex items-center space-x-2 text-xs text-gray-600 mb-3">
                        <div class="flex items-center">
                            <div class="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
                            <span>Requested: ${formatDate(request.requestDate)}</span>
                        </div>
                        ${request.confirmedDate ? `
                            <span class="text-gray-400">→</span>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                                <span>Confirmed: ${formatDate(request.confirmedDate)}</span>
                            </div>
                        ` : ''}
                        ${request.shippedDate ? `
                            <span class="text-gray-400">→</span>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
                                <span>Shipped: ${formatDate(request.shippedDate)}</span>
                            </div>
                        ` : ''}
                        ${request.deliveredDate ? `
                            <span class="text-gray-400">→</span>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                <span>Delivered: ${formatDate(request.deliveredDate)}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${request.trackingNumber ? `
                        <div class="bg-gray-50 rounded-lg px-3 py-2 inline-block">
                            <span class="text-xs text-gray-600">Tracking: </span>
                            <span class="text-xs font-mono font-medium text-gray-900">${request.trackingNumber}</span>
                            <button onclick="copyTracking('${request.trackingNumber}')" class="ml-2 text-purple-600 hover:text-purple-800">
                                <svg class="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    ` : ''}

                    ${request.estimatedDelivery ? `
                        <p class="text-sm text-gray-600 mt-2">Estimated delivery: ${formatDate(request.estimatedDelivery)}</p>
                    ` : ''}
                    ${request.estimatedShipping ? `
                        <p class="text-sm text-gray-600 mt-2">Estimated shipping: ${formatDate(request.estimatedShipping)}</p>
                    ` : ''}
                    ${request.cancelReason ? `
                        <p class="text-sm text-red-600 mt-2">Reason: ${request.cancelReason}</p>
                    ` : ''}
                </div>

                <!-- Right: Price Info -->
                <div class="lg:text-right border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 border-gray-200">
                    <div class="mb-3">
                        <p class="text-xs text-gray-500 mb-1">You paid</p>
                        <p class="text-3xl font-bold text-gray-900">${formatCurrency(request.price)}</p>
                        <p class="text-sm text-gray-500 line-through">${formatCurrency(request.originalPrice)}</p>
                    </div>
                    <div class="bg-green-50 rounded-lg px-4 py-2 mb-3">
                        <p class="text-xs text-gray-600">You saved</p>
                        <p class="text-xl font-bold text-green-600">${formatCurrency(request.savings)}</p>
                        <p class="text-xs text-green-600">${discountPercent}% discount</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        ${request.status === 'shipped' || request.status === 'delivered' ? `
                            <button onclick="trackOrder('${request.trackingNumber}')" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Track Order
                            </button>
                        ` : ''}
                        <button onclick="viewPoolDetails(${request.poolId})" class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            View Pool
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateStats() {
    const pending = requestsData.filter(r => r.status === 'pending').length;
    const confirmed = requestsData.filter(r => r.status === 'confirmed').length;
    const shipped = requestsData.filter(r => r.status === 'shipped').length;
    const totalSaved = requestsData.reduce((sum, r) => sum + r.savings, 0);

    document.getElementById('pending-count').textContent = pending;
    document.getElementById('confirmed-count').textContent = confirmed;
    document.getElementById('shipped-count').textContent = shipped;
    document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function copyTracking(trackingNumber) {
    navigator.clipboard.writeText(trackingNumber).then(() => {
        showNotification('Tracking number copied to clipboard!');
    });
}

function trackOrder(trackingNumber) {
    showNotification(`Tracking order: ${trackingNumber}`);
    // In a real app, redirect to courier tracking page
}

function viewPoolDetails(poolId) {
    showNotification('Viewing pool details...');
    // In a real app, navigate to pool details page
    setTimeout(() => {
        window.location.href = `pools.html?id=${poolId}`;
    }, 500);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.remove('translate-x-full');
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
    }, 3000);
}
