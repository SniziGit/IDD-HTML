/**
 * OVERKILL Website - Shopping Cart Functionality
 * Handles all cart operations for the products page
 * Author: OVERKILL Development Team
 * Created: 2026
 */

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

/**
 * Shopping cart array to store product items
 * Each item: { name: string, price: number }
 */
let cart = [];

// =============================================================================
// CART MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Add a product to the shopping cart
 * @param {string} productName - Name of the product
 * @param {number} price - Price of the product
 */
function addToCart(productName, price) {
    // Add item to cart array
    cart.push({ 
        name: productName, 
        price: price 
    });
    
    // Update cart display
    updateCart();
    
    // Show confirmation message
    showCartNotification(`${productName} added to cart!`);
}

/**
 * Remove an item from the shopping cart by index
 * @param {number} index - Index of item to remove
 */
function removeFromCart(index) {
    // Remove item from cart array
    cart.splice(index, 1);
    
    // Update cart display
    updateCart();
}

/**
 * Update the cart display with current items and total
 */
function updateCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    // Handle empty cart
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        return;
    }
    
    // Generate HTML for cart items
    let cartHTML = '';
    let totalPrice = 0;
    
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                <button class="cart-remove-btn" onclick="removeFromCart(${index})" title="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        totalPrice += item.price;
    });
    
    // Update DOM elements
    cartItemsElement.innerHTML = cartHTML;
    cartTotalElement.textContent = totalPrice.toFixed(2);
}

// =============================================================================
// CHECKOUT FUNCTIONALITY
// =============================================================================

/**
 * Process checkout - validate cart and proceed to payment
 */
function checkout() {
    // Check if cart is empty
    if (cart.length === 0) {
        showCartNotification('Your cart is empty! Add some products first.');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Show checkout confirmation
    showCartNotification(`Thank you for your order! Total: $${total.toFixed(2)}. Redirecting to payment...`);
    
    // Clear cart after successful order
    setTimeout(() => {
        cart = [];
        updateCart();
    }, 2000);
}

// =============================================================================
// PRODUCT SEARCH FUNCTIONALITY
// =============================================================================

/**
 * Filter products based on search query
 */
function filterProducts() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
        
        // Check if product matches search query
        const isMatch = productName.includes(searchQuery) || productDescription.includes(searchQuery);
        
        // Show/hide product card based on match
        card.style.display = isMatch ? 'block' : 'none';
        
        // Add animation class for smooth transitions
        if (isMatch) {
            card.classList.add('search-match');
            setTimeout(() => card.classList.remove('search-match'), 300);
        }
    });
}

// =============================================================================
// NAVIGATION HELPER
// =============================================================================

/**
 * Smooth scroll to products section
 */
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    
    if (productsSection) {
        productsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Show cart notification message (replaces alert for better UX)
 * @param {string} message - Message to display
 */
function showCartNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Get cart item count for display
 * @returns {number} - Number of items in cart
 */
function getCartItemCount() {
    return cart.length;
}

/**
 * Get cart total price
 * @returns {number} - Total price of items in cart
 */
function getCartTotal() {
    return cart.reduce((total, item) => total + item.price, 0);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize cart functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart display
    updateCart();
    
    // Add search input event listener with debouncing
    const searchInput = document.getElementById('search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterProducts, 300); // Debounce search
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search');
            if (searchInput) searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                filterProducts();
            }
        }
    });
});

// =============================================================================
// CONSOLE DEBUGGING
// =============================================================================

/**
 * Cart debugging utilities (only in development)
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Cart Debug Mode Enabled');
    
    // Debug function to clear cart
    window.clearCart = function() {
        cart = [];
        updateCart();
        console.log('Cart cleared');
    };
    
    // Debug function to add test items
    window.addTestItems = function() {
        addToCart('Test Product', 99.99);
        addToCart('Another Test', 49.99);
        console.log('Test items added to cart');
    };
}
