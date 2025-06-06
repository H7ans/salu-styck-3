// Modern Enhanced JavaScript for Salu & Styck
// Progressive enhancement with modern features

class SaluStyckeApp {
    constructor() {
        // ROBUST CART SYNCHRONIZATION SYSTEM
        this.cart = [];
        this.storageKey = 'salu_styck_cart';
        this.syncInterval = null;
        this.lastUpdateTime = 0;
        this.updateThrottle = 100; // Minimum ms between updates
        this.isUpdating = false;
        
        this.isCartOpen = false;
        this.isLoading = false;
        this.animations = new Set();
        this.touchStart = null;
        this.touchEnd = null;
        
        // Start optimized cart sync immediately
        this.startOptimizedCartSync();
        
        // Initialize app
        this.init();
        
        // Setup mobile menu
        this.setupMobileMenu();
    }

    startOptimizedCartSync() {
        console.log('🛒 Starting OPTIMIZED cart synchronization...');
        
        // 1. Initial load from storage
        this.forceReloadCart();
        
        // 2. Start sync every 500ms (reduced from 200ms)
        this.syncInterval = setInterval(() => {
            if (this.forceReloadCart()) {
                this.forceUpdateCartDisplay();
            }
        }, 500);
        
        // 3. Listen for storage changes with debounce
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('📡 Storage changed, syncing cart...');
                // Force immediate update on storage change
                this.forceReloadCart();
                this.forceUpdateCartDisplay();
            }
        });
        
        // 4. Listen for page focus with debounce
        window.addEventListener('focus', () => {
            console.log('👁️ Page focused, syncing cart...');
            // Force immediate update on focus
            this.forceReloadCart();
            this.forceUpdateCartDisplay();
        });
        
        // 5. Listen for visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ Page visible, syncing cart...');
                // Force immediate update on visibility change
                this.forceReloadCart();
                this.forceUpdateCartDisplay();
            }
        });

        // 6. Additional sync on page load
        window.addEventListener('load', () => {
            console.log('📄 Page loaded, syncing cart...');
            this.forceReloadCart();
            this.forceUpdateCartDisplay();
        });

        // 7. Additional sync on DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM loaded, syncing cart...');
            this.forceReloadCart();
            this.forceUpdateCartDisplay();
        });
    }

    shouldUpdate() {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateThrottle) {
            return false;
        }
        this.lastUpdateTime = now;
        return true;
    }

    forceReloadCart() {
        if (this.isUpdating) return false;
        this.isUpdating = true;
        
        try {
            const stored = localStorage.getItem(this.storageKey);
            const newCart = stored ? JSON.parse(stored) : [];
            
            // Only update if cart actually changed
            if (JSON.stringify(this.cart) !== JSON.stringify(newCart)) {
                this.cart = newCart;
                console.log('🔄 Cart synced:', this.cart.length, 'items');
                this.isUpdating = false;
                return true;
            }
            this.isUpdating = false;
            return false;
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            this.cart = [];
            this.forceSaveCart();
            this.isUpdating = false;
            return true;
        }
    }

    forceSaveCart() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            console.log('💾 Cart saved:', this.cart.length, 'items');
        } catch (error) {
            console.error('❌ Error saving cart:', error);
        }
        
        this.isUpdating = false;
    }

    forceUpdateCartDisplay() {
        if (!this.shouldUpdate()) return;
        
        requestAnimationFrame(() => {
            this.updateCartCounter();
            this.updateCartPanel();
            this.updateMobileCTA();
            this.updateShippingProgress();
        });
    }

    updateCartCounter() {
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('🔄 Updating cart counter:', itemCount, 'items');
        
        // Find all possible cart icon containers
        const cartSelectors = [
            // Desktop navigation
            '.nav-link[href="#"]',
            'a[aria-label="Varukorg"]',
            '.nav-link .cart-icon',
            // Mobile navigation
            '.mobile-nav-link[href="#"]',
            '.mobile-nav-link .mobile-cart-icon',
            // Direct cart icons
            '.cart-icon',
            '.mobile-cart-icon'
        ];
        
        // Update all cart icons
        cartSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Find the parent link if we're on an icon
                const link = element.closest('a') || element;
                if (!link) return;
                
                let counter = link.querySelector('.cart-counter');
                
                if (itemCount > 0) {
                    if (!counter) {
                        counter = document.createElement('span');
                        counter.className = 'cart-counter';
                        counter.style.cssText = `
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #dc2626;
                            color: #ffffff;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.75rem;
                            font-weight: 600;
                            border: 2px solid #ffffff;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            z-index: 1000;
                            transform: scale(0);
                            transition: transform 0.2s ease;
                        `;
                        
                        // Ensure parent has relative positioning
                        if (getComputedStyle(link).position === 'static') {
                            link.style.position = 'relative';
                        }
                        
                        link.appendChild(counter);
                    }
                    
                    // Update counter if needed
                    if (counter.textContent !== itemCount.toString()) {
                        counter.textContent = itemCount;
                        counter.style.transform = 'scale(1)';
                    }
                } else if (counter) {
                    // Remove counter if cart is empty
                    counter.style.transform = 'scale(0)';
                    setTimeout(() => counter.remove(), 200);
                }
            });
        });

        // Update mobile cart CTA
        const mobileCTA = document.getElementById('mobile-cart-cta');
        const mobileCount = document.getElementById('mobile-cart-cta-count');
        
        if (mobileCTA) {
            const shouldShow = itemCount > 0;
            if (mobileCTA.style.display === 'block' !== shouldShow) {
                mobileCTA.style.display = shouldShow ? 'block' : 'none';
                if (mobileCount && shouldShow) {
                    mobileCount.textContent = itemCount;
                }
            }
        }
    }

    updateMobileCTA() {
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const mobileCTA = document.getElementById('mobile-cart-cta');
        const mobileCount = document.getElementById('mobile-cart-cta-count');
        
        if (mobileCTA) {
            const shouldShow = itemCount > 0;
            if (mobileCTA.style.display === 'block' !== shouldShow) {
                mobileCTA.style.display = shouldShow ? 'block' : 'none';
                if (mobileCount && shouldShow) {
                    mobileCount.textContent = itemCount;
                }
            }
        }
    }

    // Legacy method for compatibility  
    reloadCart() {
        return this.forceReloadCart();
    }

    init() {
        console.log('Initializing Salu & Styck app...');
        
        this.setupEventListeners();
        this.updateCartDisplay();
        
        // Setup product buttons after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupProductButtons();
                this.setupIntersectionObserver();
                this.setupTouchGestures();
                this.setupKeyboardNavigation();
                this.preloadCriticalResources();
                
                // Force cart display update after everything is loaded
                setTimeout(() => {
                    this.updateCartDisplay();
                    console.log('App fully initialized and cart synchronized!');
                }, 100);
            });
        } else {
            this.setupProductButtons();
            this.setupIntersectionObserver();
            this.setupTouchGestures();
            this.setupKeyboardNavigation();
            this.preloadCriticalResources();
            
            // Force cart display update after everything is loaded
            setTimeout(() => {
                this.updateCartDisplay();
                console.log('App fully initialized and cart synchronized!');
            }, 100);
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.handleCookieBanner();
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Cart click handlers
        this.setupCartHandlers();

        // Form submissions
        this.setupFormSubmissions();

        // Smooth scroll for anchor links
        this.setupSmoothScroll();

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Window events
        window.addEventListener('scroll', () => this.throttle(() => this.updateHeader(), 16));
        window.addEventListener('resize', () => this.debounce(() => this.handleResize(), 250));
        window.addEventListener('beforeunload', () => this.saveAppState());
        
        // Listen for storage changes to sync cart between tabs/pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                console.log('Cart updated in another tab/page, syncing...');
                this.updateCartDisplay();
            }
        });
        
        // Also listen for focus to refresh cart when returning to page
        window.addEventListener('focus', () => {
            console.log('Page focused, refreshing cart...');
            this.updateCartDisplay();
        });
    }

    setupProductButtons() {
        // Wait for DOM to be ready
        const setupButtons = () => {
            // Setup all product buttons
            const productButtons = document.querySelectorAll('.product-btn');
            console.log('Found product buttons:', productButtons.length);
            
            productButtons.forEach(button => {
                // Remove existing listeners to avoid duplicates
                button.removeEventListener('click', this.handleProductClick);
                
                // Add new listener
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const onclick = button.getAttribute('onclick');
                    if (onclick) {
                        const match = onclick.match(/addToCart\('([^']+)',\s*'([^']+)'\)/);
                        if (match) {
                            const [, productId, productName] = match;
                            console.log('Adding to cart:', productId, productName);
                            this.addToCart(productId, productName);
                        }
                    }
                });
            });

            // Setup cart icon clicks with better selectors
            this.setupCartIcons();
        };

        // Run setup immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupButtons);
        } else {
            setupButtons();
        }
    }

    setupCartIcons() {
        // Remove existing listeners and setup new ones
        const cartSelectors = [
            '.nav-link[href="#"]',
            '.mobile-nav-link[href="#"]',
            'a[aria-label="Varukorg"]',
            '.cart-icon',
            '.mobile-cart-icon'
        ];

        cartSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements for selector: ${selector}`);
            
            elements.forEach(element => {
                // Remove existing listeners
                element.removeEventListener('click', this.handleCartClick);
                
                // Add new listener
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Cart icon clicked via selector:', selector);
                    this.toggleCartPanel();
                });
            });
        });

        // Also setup mobile cart CTA if it exists
        const mobileCTA = document.querySelector('#mobile-cart-cta button');
        if (mobileCTA) {
            mobileCTA.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile cart CTA clicked');
                this.toggleCartPanel();
            });
        }
    }

    handleCookieBanner() {
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            const banner = document.getElementById('cookie-banner');
            if (banner) banner.style.display = 'none';
        }
    }

    setupScrollEffects() {
        // Implement scroll effects
    }

    setupFormValidation() {
        // Implement form validation
    }

    setupFormSubmissions() {
        // Implement form submissions
    }

    setupSmoothScroll() {
        // Implement smooth scroll
    }

    handleOutsideClick(e) {
        // Handle clicks outside mobile menu
    }

    handleKeyboardNavigation(e) {
        // Handle keyboard navigation
    }

    updateHeader() {
        // Update header on scroll
    }

    handleResize() {
        // Handle window resize
    }

    setupIntersectionObserver() {
        // Setup intersection observer for animations
    }

    setupTouchGestures() {
        // Setup touch gestures
    }

    setupKeyboardNavigation() {
        // Setup keyboard navigation
    }

    preloadCriticalResources() {
        // Preload critical resources
    }

    // Förbättrad menyhantering
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        if (!mobileMenu || !menuIcon || !closeIcon) return;
        
        const isMenuHidden = mobileMenu.classList.contains('hidden');
        
        if (isMenuHidden) {
            // Öppna menyn
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => {
                mobileMenu.classList.add('visible');
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        if (!mobileMenu || !menuIcon || !closeIcon) return;
        
        mobileMenu.classList.remove('visible');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    }

    // Advanced Shopping Cart System
    setupCartHandlers() {
        const cartLinks = document.querySelectorAll('.nav-link[href="#"], .mobile-nav-link[href="#"]');
        cartLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartPanel();
            });
        });

        // Add specific handler for dynamically created cart buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Clear cart button handler - comprehensive detection
            if ((target.tagName === 'BUTTON' && 
                 (target.textContent?.includes('Töm varukorg') || 
                  target.innerHTML?.includes('Töm varukorg') ||
                  target.id === 'clear-cart-btn')) ||
                 target.getAttribute('onclick')?.includes('clearCart')) {
                console.log('Clear cart button detected and clicked');
                e.preventDefault();
                e.stopPropagation();
                this.clearCart();
                return;
            }

            // Checkout button handler
            if (target.tagName === 'BUTTON' && 
                (target.textContent?.includes('Gå till kassan') || 
                 target.innerHTML?.includes('Gå till kassan'))) {
                console.log('Checkout button detected and clicked');
                e.preventDefault();
                e.stopPropagation();
                this.proceedToCheckout();
                return;
            }
        });
    }

    // Live Shopping Cart with Real-time Updates
    addToCart(productId, productName) {
        console.log('addToCart called with:', productId, productName);
        
        if (!productId || !productName) {
            console.error('Missing productId or productName');
            this.showNotification('Fel: Produktinformation saknas', 'error');
            return;
        }
        
        try {
            this.showWeightSelector(productId, productName);
        } catch (error) {
            console.error('Error in addToCart:', error);
            this.showNotification('Ett fel uppstod. Försök igen.', 'error');
        }
    }

    showWeightSelector(productId, productName) {
        console.log('showWeightSelector called with:', productId, productName);
        
        try {
            const modal = this.createWeightModal(productId, productName);
            document.body.appendChild(modal);
            
            // Animate modal entrance
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
                const content = modal.querySelector('.weight-modal-content');
                if (content) {
                    content.style.transform = 'translateY(0) scale(1)';
                }
            });

            // Add escape key listener
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeWeightModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Lock body scroll
            document.body.style.overflow = 'hidden';
            
            console.log('Weight selector modal created successfully');
        } catch (error) {
            console.error('Error in showWeightSelector:', error);
            this.showNotification('Ett fel uppstod vid visning av viktval', 'error');
        }
    }

    createWeightModal(productId, productName) {
        const modal = document.createElement('div');
        modal.className = 'weight-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        // Extended weight options from 350g to 5kg
        const weightOptions = [350, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000];
        const productPrices = {
            'entrecote': 89.0,
            'ryggbiff': 69.0,
            'oxfile': 149.0,
            'flaskfile': 45.0,
            'lammkotletter': 95.0,
            'familjepaket': 55.0
        };

        modal.innerHTML = `
            <div class="weight-modal-content" style="
                background: #222222;
                border-radius: 12px;
                max-width: 420px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                border: 2px solid #ffffff;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 2px solid #ffffff;
                ">
                    <h3 style="
                        font-size: 1.125rem;
                        font-weight: 600;
                        color: #f8fafc;
                        margin: 0;
                    ">Välj vikt för ${productName}</h3>
                    <button class="close-modal" onclick="saluStyckeApp.closeWeightModal()" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #6b7280;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151'" onmouseout="this.style.background='none'; this.style.color='#6b7280'">
                        ×
                    </button>
                </div>
                
                <div style="padding: 1.5rem;">
                    <div class="weight-options" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 0.75rem;
                        margin-bottom: 1.5rem;
                    ">
                        ${weightOptions.map(weight => {
                            const price = this.calculatePrice(productId, weight, productPrices);
                            const pricePerKg = Math.round((price / (weight / 1000)) * 100) / 100;
                            const isPopular = weight === 500 || weight === 1000;
                            
                            return `
                                <button class="weight-option" data-weight="${weight}" data-product-id="${productId}" data-product-name="${productName}" style="
                                    background: ${isPopular ? '#ffffff' : '#444444'};
                                    border: ${isPopular ? '3px solid #ffffff' : '2px solid #ffffff'};
                                    border-radius: 8px;
                                    padding: 1rem 0.75rem;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    text-align: center;
                                    color: ${isPopular ? '#000000' : '#ffffff'};
                                    font-size: 0.875rem;
                                " onmouseover="
                                    this.style.borderColor='#ffffff';
                                    this.style.background='#ffffff';
                                    this.style.color='#000000';
                                " onmouseout="
                                    this.style.borderColor='#ffffff';
                                    this.style.background='${isPopular ? '#ffffff' : '#444444'}';
                                    this.style.color='${isPopular ? '#000000' : '#ffffff'}';
                                ">
                                    ${isPopular ? '<div style="font-size: 0.625rem; color: #666666; margin-bottom: 0.25rem; font-weight: 500;">POPULÄR</div>' : ''}
                                    <div style="
                                        font-size: 1rem;
                                        font-weight: 600;
                                        margin-bottom: 0.25rem;
                                        color: inherit;
                                    ">${weight >= 1000 ? (weight/1000).toFixed(weight % 1000 === 0 ? 0 : 1) + ' kg' : weight + 'g'}</div>
                                    <div style="
                                        font-size: 0.875rem;
                                        font-weight: 500;
                                        color: inherit;
                                        margin-bottom: 0.125rem;
                                    ">${price} kr</div>
                                    <div style="
                                        font-size: 0.75rem;
                                        color: #cccccc;
                                    ">${pricePerKg} kr/kg</div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="
                        background: #444444;
                        border-radius: 8px;
                        padding: 1rem;
                        border: 1px solid #ffffff;
                        text-align: center;
                        font-size: 0.75rem;
                        color: #ffffff;
                    ">
                        Premiumkött från Stora Saluhallen • Hängmörat • Vakuumförpackat
                    </div>
                </div>
            </div>
        `;

        // Add click handlers to weight options
        modal.querySelectorAll('.weight-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const weight = parseInt(e.currentTarget.dataset.weight);
                const productId = e.currentTarget.dataset.productId;
                const productName = e.currentTarget.dataset.productName;
                this.selectWeight(productId, productName, weight);
            });
        });

        return modal;
    }

    selectWeight(productId, productName, weight) {
        const productPrices = {
            'entrecote': 89.0,
            'ryggbiff': 69.0,
            'oxfile': 149.0,
            'flaskfile': 45.0,
            'lammkotletter': 95.0,
            'familjepaket': 55.0
        };

        const price = this.calculatePrice(productId, weight, productPrices);
        const cartItem = {
            id: `${productId}_${weight}`,
            productId: productId,
            name: productName,
            weight: weight,
            price: price,
            quantity: 1,
            addedAt: Date.now()
        };
        
        // Check if item already exists
        const existingItemIndex = this.cart.findIndex(item => item.id === cartItem.id);
        if (existingItemIndex !== -1) {
            this.cart[existingItemIndex].quantity += 1;
        } else {
            this.cart.push(cartItem);
        }
        
        // Force save and sync
        this.forceSaveCart();
        this.forceUpdateCartDisplay();
        this.closeWeightModal();
        this.showNotification(`${productName} (${weight}g) har lagts till i varukorgen!`, 'success');
        this.triggerHapticFeedback();
    }

    calculatePrice(productId, weight, productPrices) {
        const pricePerHundredG = productPrices[productId] || 50;
        return Math.round(pricePerHundredG * (weight / 100));
    }

    closeWeightModal() {
        const modal = document.querySelector('.weight-modal');
        if (modal) {
            modal.style.opacity = '0';
            const content = modal.querySelector('.weight-modal-content');
            content.style.transform = 'translateY(20px) scale(0.95)';
            
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // Advanced Cart Panel with Live Updates
    toggleCartPanel() {
        let cartPanel = document.getElementById('cart-panel');
        
        if (!cartPanel) {
            cartPanel = this.createCartPanel();
            document.body.appendChild(cartPanel);
            this.updateCartPanel();
        }

        if (this.isCartOpen) {
            // Close cart
            cartPanel.style.transform = 'translateX(100%)';
            cartPanel.style.opacity = '0';
            
            setTimeout(() => {
                if (cartPanel && cartPanel.parentNode) {
                    cartPanel.parentNode.removeChild(cartPanel);
                }
            }, 400);
            
            this.isCartOpen = false;
            document.body.style.overflow = '';
        } else {
            // Open cart
            cartPanel.style.transform = 'translateX(0)';
            cartPanel.style.opacity = '1';
            
            this.isCartOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Update cart content
            this.updateCartPanel();
            
            // Add click outside to close
            setTimeout(() => {
                const handleClickOutside = (e) => {
                    if (!cartPanel.contains(e.target)) {
                        this.toggleCartPanel();
                        document.removeEventListener('click', handleClickOutside);
                    }
                };
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }
    }

    createCartPanel() {
        const panel = document.createElement('div');
        panel.id = 'cart-panel';
        panel.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            max-width: 400px;
            height: 100vh;
            background: #222222;
            border-left: 2px solid #ffffff;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.6);
            z-index: 1500;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        panel.innerHTML = `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 2px solid #ffffff;
                background: #222222;
            ">
                <h3 style="
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: #94a3b8;">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32a2 2 0 002 2.68h9.36a2 2 0 002-2.68L17 13M7 13v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0h6"></path>
                    </svg>
                    Varukorg
                    <span id="cart-live-count" style="
                        background: #374151;
                        color: #ffffff;
                        padding: 0.125rem 0.5rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 500;
                        min-width: 20px;
                        text-align: center;
                    ">0</span>
                </h3>
                <button onclick="saluStyckeApp.toggleCartPanel()" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #6b7280;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151'" onmouseout="this.style.background='none'; this.style.color='#6b7280'">
                    ×
                </button>
            </div>

            <div id="cart-items" style="
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                background: #000000;
            ">
                <div id="empty-cart" style="
                    text-align: center;
                    padding: 3rem 1.5rem;
                    color: #6b7280;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 1rem;
                        background: #f3f4f6;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32a2 2 0 002 2.68h9.36a2 2 0 002-2.68L17 13M7 13v4a2 2 0 002 2h2a2 2 0 002-2v-4m-6 0h6"></path>
                        </svg>
                    </div>
                    <h4 style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem; color: #374151;">Varukorgen är tom</h4>
                    <p style="margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.875rem;">Lägg till produkter för att börja handla.</p>
                    <a href="produkter.html" style="
                        background: #374151;
                        color: #ffffff;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: 500;
                        display: inline-block;
                        transition: all 0.2s ease;
                        font-size: 0.875rem;
                    " onmouseover="this.style.background='#111827'" onmouseout="this.style.background='#374151'">
                        Handla kött
                    </a>
                </div>
            </div>

            <div id="cart-footer" style="
                border-top: 1px solid #444444;
                background: #000000;
                padding: 1.5rem;
                display: none;
            ">
                <!-- Free shipping progress -->
                <div id="cart-shipping-progress" style="
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #f3f4f6;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                        font-size: 0.75rem;
                        font-weight: 500;
                    ">
                        <span id="shipping-text" style="color: #374151;">500 kr kvar till fri frakt</span>
                        <span style="color: #6b7280;">🚚</span>
                    </div>
                    <div style="
                        width: 100%;
                        height: 6px;
                        background: #e5e7eb;
                        border-radius: 6px;
                        overflow: hidden;
                    ">
                        <div id="shipping-bar" style="
                            height: 100%;
                            width: 0%;
                            background: #374151;
                            transition: width 0.3s ease;
                            border-radius: 6px;
                        "></div>
                    </div>
                </div>

                <!-- Cart summary -->
                <div style="
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border: 1px solid #f3f4f6;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                        color: #6b7280;
                    ">
                        <span>Delsumma</span>
                        <span id="cart-subtotal">0 kr</span>
                    </div>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                        color: #6b7280;
                    ">
                        <span>Frakt</span>
                        <span id="cart-shipping">49 kr</span>
                    </div>
                    <div style="
                        border-top: 1px solid #e5e7eb;
                        padding-top: 0.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 1rem;
                        font-weight: 600;
                        color: #ffffff;
                    ">
                        <span>Totalt</span>
                        <span id="cart-total">0 kr</span>
                    </div>
                </div>

                <!-- Action buttons -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button onclick="saluStyckeApp.proceedToCheckout()" style="
                        background: #ffffff;
                        color: #000000;
                        border: 2px solid #ffffff;
                        padding: 1rem 1.5rem;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 0.875rem;
                    " onmouseover="this.style.background='#000000'; this.style.color='#ffffff'; this.style.borderColor='#ffffff';" onmouseout="this.style.background='#ffffff'; this.style.color='#000000'; this.style.borderColor='#ffffff';">
                        Gå till kassan
                    </button>
                    <button id="clear-cart-btn" style="
                        background: #000000;
                        color: #ffffff;
                        border: 2px solid #ffffff;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 0.875rem;
                    " onmouseover="this.style.background='#ffffff'; this.style.color='#000000'; this.style.borderColor='#ffffff';" onmouseout="this.style.background='#000000'; this.style.color='#ffffff'; this.style.borderColor='#ffffff';">
                        Töm varukorg
                    </button>
                </div>
            </div>
        `;

        return panel;
    }

    updateCartDisplay() {
        // Force sync and update
        this.forceReloadCart();
        this.forceUpdateCartDisplay();
    }

    updateCartPanel() {
        const cartPanel = document.getElementById('cart-panel');
        if (!cartPanel) return;

        const cartItems = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');
        const emptyCart = document.getElementById('empty-cart');
        const cartLiveCount = document.getElementById('cart-live-count');

        // Update live count
        if (cartLiveCount) {
            cartLiveCount.textContent = this.cart.length;
            cartLiveCount.style.animation = 'none';
            setTimeout(() => cartLiveCount.style.animation = 'pulse 2s infinite', 10);
        }

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        // Calculate totals
        let subtotal = 0;
        this.cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const shippingCost = subtotal >= 500 ? 0 : 49;
        const total = subtotal + shippingCost;

        // Update shipping progress
        this.updateShippingProgress(subtotal);

        // Update cart items display
        if (cartItems) {
            cartItems.innerHTML = `
                <div style="padding: 0;">
                    ${this.cart.map((item, index) => `
                        <div style="
                            background: #222222;
                            border-radius: 8px;
                            padding: 1rem;
                            margin-bottom: 0.75rem;
                            border: 1px solid #444444;
                            box-shadow: 0 2px 8px rgba(255, 255, 255, 0.04);
                            transition: all 0.2s ease;
                        " onmouseover="this.style.boxShadow='0 4px 16px rgba(255, 255, 255, 0.08)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(255, 255, 255, 0.04)'">
                            
                            <!-- Product header -->
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                margin-bottom: 0.75rem;
                            ">
                                <div style="flex: 1;">
                                    <h4 style="
                                        font-size: 1rem;
                                        font-weight: 600;
                                        color: #ffffff;
                                        margin-bottom: 0.25rem;
                                    ">${item.name}</h4>
                                    <div style="
                                        font-size: 0.75rem;
                                        color: #6b7280;
                                        font-weight: 500;
                                    ">${item.weight >= 1000 ? (item.weight/1000).toFixed(item.weight % 1000 === 0 ? 0 : 1) + ' kg' : item.weight + 'g'}</div>
                                </div>
                                <button onclick="saluStyckeApp.removeFromCart('${item.id}')" style="
                                    background: #fef2f2;
                                    border: none;
                                    color: #dc2626;
                                    width: 28px;
                                    height: 28px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: all 0.2s ease;
                                    font-size: 1rem;
                                " onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                                    ×
                                </button>
                            </div>

                            <!-- Quantity controls -->
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                background: #111111;
                                border-radius: 6px;
                                padding: 0.75rem;
                                border: 1px solid #444444;
                            ">
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.75rem;
                                ">
                                    <button onclick="saluStyckeApp.updateQuantity('${item.id}', -1)" style="
                                        background: #ffffff;
                                        border: 2px solid #ffffff;
                                        color: #000000;
                                        width: 28px;
                                        height: 28px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        transition: all 0.2s ease;
                                        font-size: 1rem;
                                        font-weight: 500;
                                    " onmouseover="this.style.background='#000000'; this.style.color='#ffffff'; this.style.borderColor='#ffffff';" onmouseout="this.style.background='#ffffff'; this.style.color='#000000'; this.style.borderColor='#ffffff';">
                                        −
                                    </button>
                                    <span style="
                                        font-size: 1rem;
                                        font-weight: 500;
                                        color: #ffffff;
                                        min-width: 20px;
                                        text-align: center;
                                    ">${item.quantity}</span>
                                    <button onclick="saluStyckeApp.updateQuantity('${item.id}', 1)" style="
                                        background: #ffffff;
                                        border: 2px solid #ffffff;
                                        color: #000000;
                                        width: 28px;
                                        height: 28px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        transition: all 0.2s ease;
                                        font-size: 1rem;
                                        font-weight: 500;
                                    " onmouseover="this.style.background='#000000'; this.style.color='#ffffff'; this.style.borderColor='#ffffff';" onmouseout="this.style.background='#ffffff'; this.style.color='#000000'; this.style.borderColor='#ffffff';">
                                        +
                                    </button>
                                </div>
                                <div style="
                                    font-size: 1rem;
                                    font-weight: 600;
                                    color: #ffffff;
                                ">${(item.price * item.quantity).toFixed(0)} kr</div>
                            </div>

                            <!-- Price per kg info -->
                            <div style="
                                margin-top: 0.5rem;
                                font-size: 0.75rem;
                                color: #9ca3af;
                                text-align: center;
                            ">
                                ${(item.price / (item.weight / 1000)).toFixed(0)} kr/kg
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Update totals
        document.getElementById('cart-subtotal').textContent = `${subtotal.toFixed(0)} kr`;
        document.getElementById('cart-shipping').textContent = shippingCost === 0 ? 'Gratis' : `${shippingCost} kr`;
        document.getElementById('cart-total').textContent = `${total.toFixed(0)} kr`;
    }

    updateShippingProgress(subtotal = null) {
        // Calculate subtotal if not provided
        if (subtotal === null) {
            subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        // Update main shipping progress bar (in header)
        const shippingText = document.getElementById('free-shipping-text');
        const shippingBar = document.getElementById('free-shipping-bar');
        
        // Also update cart shipping progress
        const cartShippingText = document.getElementById('shipping-text');
        const cartShippingBar = document.getElementById('shipping-bar');

        const freeShippingThreshold = 500;
        const remaining = Math.max(0, freeShippingThreshold - subtotal);
        const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

        const textContent = remaining > 0 ? 
            `${remaining} kr kvar till fri frakt` : 
            '🎉 Du har fri frakt!';
        const textColor = remaining > 0 ? '#ffffff' : '#10b981';

        // Update main shipping progress
        if (shippingText) {
            shippingText.textContent = textContent;
            shippingText.style.color = textColor;
        }
        if (shippingBar) {
            shippingBar.style.width = `${progress}%`;
        }

        // Update cart shipping progress
        if (cartShippingText) {
            cartShippingText.textContent = textContent;
            cartShippingText.style.color = textColor;
        }
        if (cartShippingBar) {
            cartShippingBar.style.width = `${progress}%`;
        }
    }

    updateQuantity(itemId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
            }
            this.forceSaveCart();
            this.forceUpdateCartDisplay();
            this.triggerHapticFeedback();
        }
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.forceSaveCart();
        this.forceUpdateCartDisplay();
        this.showNotification('Produkten har tagits bort från varukorgen', 'success');
        this.triggerHapticFeedback();
    }

    clearCart() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        console.log('🗑️ Clearing cart...');
        
        if (this.cart.length === 0) {
            this.showNotification('Varukorgen är redan tom', 'info');
            this.isUpdating = false;
            return;
        }
        
        if (confirm('Är du säker på att du vill tömma varukorgen?')) {
            this.cart = [];
            localStorage.removeItem(this.storageKey);
            this.forceSaveCart();
            this.forceUpdateCartDisplay();
            this.showNotification('Varukorgen har tömts', 'success');
        }
        
        this.isUpdating = false;
    }

    // Live Checkout System
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Din varukorg är tom', 'error');
            return;
        }
        
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Create live checkout modal
        this.showLiveCheckout(totalPrice, itemCount);
    }

    showLiveCheckout(totalPrice, itemCount) {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.style.opacity = '0';
        
        modal.innerHTML = `
            <div class="checkout-modal-content" style="transform: translateY(20px) scale(0.95);">
                <div class="checkout-header">
                    <h3>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <path d="m16,8l2,-2 2,2"></path>
                            <path d="m18,6v8a2 2 0 0,1 -2,2H4a2 2 0 0,1 -2,-2V6"></path>
                        </svg>
                        Slutför köp
                    </h3>
                    <button class="close-checkout" onclick="saluStyckeApp.closeCheckout()">×</button>
                </div>
                
                <div class="checkout-summary">
                    <h4>Ordersammanfattning</h4>
                    <div class="checkout-items">
                        ${this.cart.map(item => `
                            <div class="checkout-item">
                                <span>${item.name} (${item.weight}g) × ${item.quantity}</span>
                                <span>${item.price * item.quantity} kr</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="checkout-total">
                        <div class="checkout-subtotal">
                            <span>Delsumma:</span>
                            <span>${totalPrice} kr</span>
                        </div>
                        <div class="checkout-delivery">
                            <span>Leverans:</span>
                            <span>${totalPrice >= 500 ? 'Gratis' : '49 kr'}</span>
                        </div>
                        <div class="checkout-final-total">
                            <span>Totalt:</span>
                            <span>${totalPrice + (totalPrice >= 500 ? 0 : 49)} kr</span>
                        </div>
                    </div>
                </div>
                
                <div class="checkout-form">
                    <form id="checkout-form">
                        <div class="form-section">
                            <h4>Leveransadress</h4>
                            <div class="form-row">
                                <input type="text" name="firstName" placeholder="Förnamn" required>
                                <input type="text" name="lastName" placeholder="Efternamn" required>
                            </div>
                            <input type="email" name="email" placeholder="E-postadress" required>
                            <input type="tel" name="phone" placeholder="Telefonnummer" required>
                            <input type="text" name="address" placeholder="Gatuadress" required>
                            <div class="form-row">
                                <input type="text" name="postalCode" placeholder="Postnummer" required>
                                <input type="text" name="city" placeholder="Stad" required>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Leveranstid</h4>
                            <select name="deliveryTime" required>
                                <option value="">Välj leveranstid</option>
                                <option value="09-12">09:00 - 12:00</option>
                                <option value="12-15">12:00 - 15:00</option>
                                <option value="15-18">15:00 - 18:00</option>
                                <option value="18-20">18:00 - 20:00</option>
                            </select>
                        </div>
                        
                        <div class="form-section">
                            <h4>Betalning</h4>
                            <div class="payment-methods">
                                <label class="payment-method">
                                    <input type="radio" name="payment" value="card" checked>
                                    <span>Kort (Visa, Mastercard)</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="payment" value="swish">
                                    <span>Swish</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="payment" value="klarna">
                                    <span>Klarna</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="checkout-actions">
                    <button class="checkout-cancel" onclick="saluStyckeApp.closeCheckout()">Avbryt</button>
                    <button class="checkout-submit" onclick="saluStyckeApp.submitOrder()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4"></path>
                            <circle cx="12" cy="12" r="9"></circle>
                        </svg>
                        Genomför beställning
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Animate modal entrance
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('.checkout-modal-content');
            content.style.transform = 'translateY(0) scale(1)';
        });
    }

    closeCheckout() {
        const modal = document.querySelector('.checkout-modal');
        if (modal) {
            modal.style.opacity = '0';
            const content = modal.querySelector('.checkout-modal-content');
            content.style.transform = 'translateY(20px) scale(0.95)';
            
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        }
    }

    submitOrder() {
        const form = document.getElementById('checkout-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const orderData = Object.fromEntries(formData);
        orderData.items = this.cart;
        orderData.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderData.orderId = this.generateOrderId();
        orderData.timestamp = new Date().toISOString();
        
        // Simulate order processing
        this.processOrder(orderData);
    }

    processOrder(orderData) {
        const submitBtn = document.querySelector('.checkout-submit');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            Bearbetar...
        `;
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Store order locally (in real app, send to server)
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear cart
            this.cart = [];
            this.updateCartDisplay();
            
            // Close checkout and cart
            this.closeCheckout();
            if (this.isCartOpen) {
                this.toggleCartPanel();
            }
            
            // Show success message
            this.showOrderConfirmation(orderData);
            
        }, 2000);
    }

    showOrderConfirmation(orderData) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.style.opacity = '0';
        
        modal.innerHTML = `
            <div class="confirmation-content" style="transform: translateY(20px) scale(0.95);">
                <div class="confirmation-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 12l2 2 4-4"></path>
                        <circle cx="12" cy="12" r="9"></circle>
                    </svg>
                </div>
                <h3>Tack för din beställning!</h3>
                <p>Ordernummer: <strong>${orderData.orderId}</strong></p>
                <p>Vi levererar din beställning ${orderData.deliveryTime} imorgon.</p>
                <p>En bekräftelse har skickats till ${orderData.email}</p>
                <button class="confirmation-close" onclick="saluStyckeApp.closeConfirmation()">
                    Stäng
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('.confirmation-content');
            content.style.transform = 'translateY(0) scale(1)';
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            this.closeConfirmation();
        }, 5000);
    }

    closeConfirmation() {
        const modal = document.querySelector('.confirmation-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    }

    generateOrderId() {
        return 'SS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Advanced Notification System
    showNotification(message, type = 'success', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="9"></circle></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        
        notification.innerHTML = `
            ${icon}
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }

    // Utility Functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    saveCartToStorage() {
        this.forceSaveCart();
    }

    saveAppState() {
        this.saveCartToStorage();
        localStorage.setItem('lastVisit', Date.now());
    }

    // Additional modern features would continue...
    // Cookie banner, form validation, animations, etc.
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple instances
    if (window.saluStyckeApp) {
        console.log('App already initialized, updating display...');
        window.saluStyckeApp.updateCartDisplay();
        return;
    }
    
    // Initialize the app
    const saluStyckeApp = new SaluStyckeApp();

    // Global functions for onclick handlers
    window.toggleMobileMenu = function() { 
        saluStyckeApp.toggleMobileMenu(); 
    };

    window.addToCart = function(productId, productName) { 
        saluStyckeApp.addToCart(productId, productName); 
    };

    window.acceptCookies = function() { 
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'none';
            localStorage.setItem('cookiesAccepted', 'true');
        }
    };

    // Make sure cart functions are available globally
    window.saluStyckeApp = saluStyckeApp;
    
    // Global functions for backwards compatibility
    window.clearCart = function() {
        if (window.saluStyckeApp) {
            window.saluStyckeApp.clearCart();
        }
    };

    // Additional event delegation for product buttons
    document.addEventListener('click', function(e) {
        // Handle product buttons
        if (e.target.classList.contains('product-btn')) {
            e.preventDefault();
            const onclick = e.target.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/addToCart\('([^']+)',\s*'([^']+)'\)/);
                if (match) {
                    const [, productId, productName] = match;
                    saluStyckeApp.addToCart(productId, productName);
                }
            }
        }

        // Handle cart icons - multiple ways to catch them
        const isCartIcon = e.target.closest('.nav-link[href="#"]') || 
                          e.target.closest('.mobile-nav-link[href="#"]') ||
                          e.target.closest('a[aria-label="Varukorg"]') ||
                          e.target.classList.contains('cart-icon') ||
                          e.target.classList.contains('mobile-cart-icon') ||
                          e.target.closest('.cart-icon') ||
                          e.target.closest('.mobile-cart-icon');

        if (isCartIcon) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked via delegation');
            saluStyckeApp.toggleCartPanel();
        }

        // Handle mobile menu button
        if (e.target.closest('.mobile-menu-btn')) {
            e.preventDefault();
            saluStyckeApp.toggleMobileMenu();
        }

        // Handle mobile cart CTA
        if (e.target.closest('#mobile-cart-cta button')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile cart CTA clicked via delegation');
            saluStyckeApp.toggleCartPanel();
        }

        // Handle clear cart button - multiple ways to catch it
        if (e.target.closest('#clear-cart-btn') || 
            e.target.textContent === 'Töm varukorg' ||
            e.target.innerHTML === 'Töm varukorg' ||
            (e.target.tagName === 'BUTTON' && e.target.textContent.includes('Töm'))) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clear cart button clicked via delegation');
            saluStyckeApp.clearCart();
        }
    });

    console.log('Salu & Styck app initialized successfully!');
});


