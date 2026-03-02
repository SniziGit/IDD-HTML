/**
 * OVERKILL Website - Main JavaScript File
 * Handles all interactive features and animations for the main website
 */

// 3D MODEL VIEWER FUNCTIONALITY


/**
Initialize 3D model viewer functionality
 **/
function initializeModelViewer() {
    const modelPlaceholder = document.querySelector('.model-placeholder');
    if (modelPlaceholder) {
        let currentRotation = 0;
        
        // Add initial rotation animation
        modelPlaceholder.style.animation = 'modelRotate 20s linear infinite';
        
        // Store rotation state
        modelPlaceholder.dataset.rotation = currentRotation;
    }
}

/**
 * Rotate 3D model in specified direction
 * @param {string} direction - 'left' or 'right'
 */
function rotateModel(direction) {
    const modelPlaceholder = document.querySelector('.model-placeholder');
    if (!modelPlaceholder) return;
    
    // Pause auto-rotation
    modelPlaceholder.style.animation = 'none';
    
    let currentRotation = parseInt(modelPlaceholder.dataset.rotation) || 0;
    const rotationStep = 45; // Rotate 45 degrees per click
    
    if (direction === 'left') {
        currentRotation -= rotationStep;
    } else if (direction === 'right') {
        currentRotation += rotationStep;
    }
    
    // Apply rotation
    modelPlaceholder.style.transform = `rotateY(${currentRotation}deg)`;
    modelPlaceholder.dataset.rotation = currentRotation;
    
    // Resume auto-rotation after 3 seconds
    setTimeout(() => {
        modelPlaceholder.style.animation = `modelRotate 20s linear infinite`;
    }, 3000);
}

/**
 * Reset 3D model to initial position
 */
function resetModel() {
    const modelPlaceholder = document.querySelector('.model-placeholder');
    if (!modelPlaceholder) return;
    
    // Reset to initial position
    modelPlaceholder.style.transform = 'rotateY(0deg)';
    modelPlaceholder.dataset.rotation = 0;
    
    // Resume auto-rotation after 1 second
    setTimeout(() => {
        modelPlaceholder.style.animation = `modelRotate 20s linear infinite`;
    }, 1000);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize all website functionality when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeSmoothScrolling();
    initializeHeaderEffects();
    initializeScrollAnimations();
    initializeParallaxEffects();
    initializeTypingEffect();
    initializeProductHoverEffects();
    initializeActiveNavigation();
    initializeModelViewer();
    initializeProductPageFeatures();
});

// =============================================================================
// SMOOTH SCROLLING FUNCTIONALITY
// =============================================================================

/**
 * Initialize smooth scrolling for all anchor links
 */
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =============================================================================
// HEADER EFFECTS
// =============================================================================

/**
 * Initialize dynamic header effects based on scroll position
 */
function initializeHeaderEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update header background and blur based on scroll position
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            header.style.backdropFilter = 'blur(15px)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            header.style.backdropFilter = 'blur(10px)';
        }
    });
}

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

/**
 * Initialize scroll-triggered animations for various elements
 */
function initializeScrollAnimations() {
    // Configuration for intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Create intersection observer for fade-in animations
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Select elements to animate and set initial state
    const animateElements = document.querySelectorAll('.feature, .showcase, .vision-item, .service-item');
    animateElements.forEach(el => {
        // Set initial hidden state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Start observing
        observer.observe(el);
    });
}

// =============================================================================
// PARALLAX EFFECTS
// =============================================================================

/**
 * Initialize parallax scrolling effects for hero section
 */
function initializeParallaxEffects() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            
            // Apply parallax to hero title
            const heroTitle = hero.querySelector('h1');
            if (heroTitle) {
                heroTitle.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
            
            // Apply parallax to subtitle with reduced speed
            const heroSubtitle = hero.querySelector('.subtitle');
            if (heroSubtitle) {
                heroSubtitle.style.transform = `translateY(${scrolled * parallaxSpeed * 0.5}px)`;
            }
        });
    }
}

// =============================================================================
// TYPING EFFECT
// =============================================================================

/**
 * Initialize typing animation for hero title (home page only)
 */
function initializeTypingEffect() {
    const heroTitle = document.querySelector('.hero:not(#products-hero):not(#preorder-hero) h1');
    
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '3px solid #ff3366';
        
        let charIndex = 0;
        
        /**
         * Type out characters one by one
         */
        function typeWriter() {
            if (charIndex < text.length) {
                heroTitle.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100); // Type speed: 100ms per character
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
}

// =============================================================================
// PRODUCT HOVER EFFECTS
// =============================================================================

/**
 * Initialize enhanced hover effects for product cards
 */
function initializeProductHoverEffects() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Mouse enter - enhance card appearance
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        // Mouse leave - reset card appearance
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// =============================================================================
// ACTIVE NAVIGATION
// =============================================================================

/**
 * Initialize active state highlighting for navigation based on scroll position
 */
function initializeActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href$=".html"]');
    
    /**
     * Update active navigation link based on current scroll position
     */
    function updateActiveNav() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100; // Offset for header height
            const sectionId = section.getAttribute('id');
            
            // Check if current scroll is within this section
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Update on scroll and initialize on load
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Debounce function to limit function calls during rapid events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================================================
// PAGE LOADING ANIMATION
// =============================================================================

/**
 * Initialize page loading fade-in effect
 */
window.addEventListener('load', function() {
    // Set initial state
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Fade in after a short delay
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// =============================================================================
// PRODUCT PAGE FEATURES
// =============================================================================

/**
 * Initialize product page interactive features
 */
function initializeProductPageFeatures() {
    initializeRamSlider();
    initializeColorButtons();
    initializePreorderForm();
    initializeProductCarousel();
}

/**
 * Initialize product image carousel functionality
 */
function initializeProductCarousel() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!mainImage || thumbnails.length === 0) return;
    
    // Store current image index
    let currentImageIndex = 0;
    
    /**
     * Update main image and active states
     * @param {number} index - Image index to display
     */
    function updateMainImage(index) {
        const thumbnail = thumbnails[index];
        if (!thumbnail) return;
        
        const fullImageUrl = thumbnail.dataset.fullImage;
        const thumbnailImg = thumbnail.querySelector('img');
        
        // Update main image with fade effect
        mainImage.style.opacity = '0';
        
        setTimeout(() => {
            mainImage.src = fullImageUrl;
            mainImage.alt = thumbnailImg.alt;
            mainImage.style.opacity = '1';
        }, 200);
        
        // Update active states for thumbnails
        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Update active states for indicators
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        currentImageIndex = index;
    }
    
    // Add click events to thumbnails
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            updateMainImage(index);
        });
        
        // Add hover effect for better UX
        thumbnail.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(8px) scale(1.02)';
            }
        });
        
        thumbnail.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = '';
            }
        });
    });
    
    // Add click events to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            updateMainImage(index);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
            updateMainImage(currentImageIndex - 1);
        } else if (e.key === 'ArrowRight' && currentImageIndex < thumbnails.length - 1) {
            updateMainImage(currentImageIndex + 1);
        }
    });
    
    // Add touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    mainImage.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    mainImage.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentImageIndex < thumbnails.length - 1) {
                // Swipe left - next image
                updateMainImage(currentImageIndex + 1);
            } else if (diff < 0 && currentImageIndex > 0) {
                // Swipe right - previous image
                updateMainImage(currentImageIndex - 1);
            }
        }
    }
    
    // Add smooth transition to main image
    mainImage.style.transition = 'opacity 0.3s ease';
    
    // Preload images for smoother transitions
    thumbnails.forEach(thumbnail => {
        const fullImageUrl = thumbnail.dataset.fullImage;
        if (fullImageUrl) {
            const img = new Image();
            img.src = fullImageUrl;
        }
    });
}

/**
 * Initialize RAM capacity slider functionality
 */
function initializeRamSlider() {
    const ramSlider = document.getElementById('ramSlider');
    const sliderValue = document.querySelector('.slider-value');
    
    if (ramSlider && sliderValue) {
        // Define allowed RAM values and their prices
        const ramConfig = {
            16: { price: 299, label: '16GB' },
            32: { price: 369, label: '32GB' },
            64: { price: 679, label: '64GB' },
            128: { price: 999, label: '128GB' }
        };
        
        // Update value display when slider changes
        ramSlider.addEventListener('input', function() {
            let value = parseInt(this.value);
            
            // Snap to nearest allowed value
            let closestValue = 16;
            let smallestDiff = Math.abs(value - closestValue);
            
            for (let ramSize in ramConfig) {
                const diff = Math.abs(value - parseInt(ramSize));
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    closestValue = parseInt(ramSize);
                }
            }
            
            // Update slider to snapped value
            this.value = closestValue;
            sliderValue.textContent = ramConfig[closestValue].label;
            
            // Update model display and price
            updateModelDisplay(closestValue);
            updatePrice(ramConfig[closestValue].price);
        });
        
        // Initialize display
        const initialValue = parseInt(ramSlider.value);
        sliderValue.textContent = ramConfig[initialValue].label;
        updatePrice(ramConfig[initialValue].price);
    }
}

/**
 * Update price display
 * @param {number} price - New price value
 */
function updatePrice(price) {
    // Find the price span specifically in the PRICE detail item
    const detailItems = document.querySelectorAll('.detail-item');
    let priceDisplay = null;
    
    for (let item of detailItems) {
        const label = item.querySelector('label');
        if (label && label.textContent === 'PRICE') {
            priceDisplay = item.querySelector('span');
            break;
        }
    }
    
    if (priceDisplay) {
        priceDisplay.textContent = `$${price} USD`;
    }
}

/**
 * Initialize color selection buttons and custom color wheel
 */
function initializeColorButtons() {
    // Preset color buttons (black and white)
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all preset buttons
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get color from data attribute
            const selectedColor = this.dataset.color;
            
            // Update preview
            if (colorPreview) {
                colorPreview.style.backgroundColor = selectedColor;
            }
            
            // Update product preview
            updateProductColor(selectedColor);
        });
    });
    
    // Pre-order form color selection buttons
    const colorSelectButtons = document.querySelectorAll('.color-select-btn');
    colorSelectButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons in same group
            this.parentElement.querySelectorAll('.color-select-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update form hidden field or data
            const selectedColor = this.textContent.toLowerCase();
            updateFormColorSelection(selectedColor);
        });
    });
}


/**
 * Initialize pre-order form submission
 */
function initializePreorderForm() {
    const preorderForm = document.querySelector('.preorder-form-fields');
    
    if (preorderForm) {
        preorderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const fullName = this.querySelector('input[placeholder="FULL NAME"]').value;
            const phoneNumber = this.querySelector('input[placeholder="PHONE NUMBER"]').value;
            const email = this.querySelector('input[placeholder="EMAIL"]').value;
            const selectedColor = document.querySelector('.color-select-btn.active').textContent;
            const ramCapacity = document.getElementById('ramSlider').value;
            
            // Validate form
            if (!fullName || !phoneNumber || !email) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            submitPreorder({
                fullName,
                phoneNumber,
                email,
                color: selectedColor,
                ramCapacity: ramCapacity + 'GB',
                model: 'Ignis WRAITH DDR5 RGB',
                price: '$999 USD'
            });
        });
    }
}

/**
 * Update model display based on RAM capacity
 * @param {string} capacity - RAM capacity in GB
 */
function updateModelDisplay(capacity) {
    const modelDisplay = document.querySelector('.detail-item span');
    if (modelDisplay && modelDisplay.textContent.includes('RAM')) {
        const currentModel = modelDisplay.textContent;
        const updatedModel = currentModel.replace(/\d+GB RAM/, capacity + 'GB RAM');
        modelDisplay.textContent = updatedModel;
    }
}

/**
 * Update product color preview
 * @param {string} color - Selected color (hex, rgb, or named color)
 */
function updateProductColor(color) {
    const productImage = document.querySelector('.product-image-placeholder');
    if (productImage) {
        // Apply color filter to simulate different product colors
        if (color === '#ffffff' || color === 'white') {
            productImage.style.filter = 'brightness(1.5) contrast(0.8)';
        } else if (color === '#000000' || color === 'black') {
            productImage.style.filter = 'none';
        } else {
            // For custom colors, apply a subtle tint effect
            productImage.style.filter = `sepia(0.2) hue-rotate(${getHueRotation(color)}deg) saturate(1.2)`;
        }
    }
}

/**
 * Calculate hue rotation from hex color
 * @param {string} hex - Hex color value
 * @returns {number} - Hue rotation in degrees
 */
function getHueRotation(hex) {
    // Convert hex to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    
    // Convert RGB to HSL and get hue
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return Math.round(h * 360);
}

/**
 * Update form color selection
 * @param {string} color - Selected color
 */
function updateFormColorSelection(color) {
    // This could update a hidden input field or form data
    const hiddenColorInput = document.querySelector('input[name="color"]');
    if (hiddenColorInput) {
        hiddenColorInput.value = color;
    } else {
        // Create hidden input if it doesn't exist
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'color';
        input.value = color;
        document.querySelector('.preorder-form-fields').appendChild(input);
    }
}

/**
 * Submit pre-order form
 * @param {Object} orderData - Order information
 */
function submitPreorder(orderData) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'PROCESSING...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Pre-order submitted successfully! We will contact you soon.', 'success');
        
        // Reset form
        document.querySelector('.preorder-form-fields').reset();
        
        // Log order data (in real implementation, this would be sent to server)
        console.log('Pre-order submitted:', orderData);
    }, 2000);
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success/error)
 */
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 14px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

