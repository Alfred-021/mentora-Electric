     // script.js - FIXED CHECKOUT AND PROFILE ISSUES
class ProductGallery {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.favoriteProducts = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.currentSort = 'name-asc';
        this.currentUser = null;

        this.services = {
            'pcb-design': {
                title: 'PCB Design Service',
                description: 'Professional circuit board design services including schematic capture, layout, and signal integrity analysis for your electronic projects. We specialize in creating optimized PCB layouts that meet your specific requirements.',
                imageUrl: 'images/pcbdesign.jpeg',
                features: [
                    'Schematic capture and circuit design',
                    'Multi-layer PCB layout',
                    'Signal integrity analysis',
                    'Impedance control',
                    'Design for manufacturability (DFM)',
                    '3D modeling and visualization',
                    'Gerber file generation',
                    'Design review and optimization'
                ],
                price: 'Starting from Ksh. 750.00'
            },
            'electronic-components': {
                title: 'Electronic Components',
                description: 'High-quality electronic components including resistors, capacitors, inductors, diodes, and integrated circuits for all your design needs.',
                imageUrl: 'images/electroniccomponents.jpg',
                features: [
                    'Genuine & Tested Components',
                    'Bulk Pricing for Student Projects',
                    'Surface Mount(SMD) & Through-Hole options',
                    'Industrial Grade Tolerance Levels',
                    'Official Datasheets Provided',
                    'Available for Same-Day Pickup',
                    'Anti-Static Packaging Included',
                    'Verified Compatibility with Mentora PCBs'
                ],
                price: 'Starting from Ksh. 5.00'
            },
            'fabrication': {
                title: 'PCB Fabrication & Etching',
                description: 'Professional-grade board manufacturing from single-sided prototypes to complex etched circuits with high precision.',
                imageUrl: 'images/pcbcomp.jpg',
                features: [
                    'High-Precision Chemical Etching',
                    'Professional FR4 & Phenolic Board Substrates',
                    'Through-hole assembly',
                    'Custom Solder Mask Application (Green/Blue/Black)',
                    'Component sourcing',
                    'Final product assembly',
                    'Packaging and shipping',
                    'RoHS compliant materials'
                ],
                price: 'Starting from Ksh. 1,000.00'
            },
            'laptop-repair': {
                title: 'Laptop Repair Services',
                description: 'Professional laptop repair services including motherboard-level diagnostics, component replacement, and data recovery. We repair all major brands and models.',
                imageUrl: 'images/motherboard.jpg',
                features: [
                    'Motherboard-level diagnostics',
                    'Screen replacement',
                    'Keyboard and touchpad repair',
                    'Battery replacement',
                    'Data recovery services',
                    'Virus removal',
                    'Hardware upgrades',
                    'Warranty on all repairs'
                ],
                price: 'Starting from Ksh. 500.00'
            },
            'mobile-repair': {
                title: 'Mobile Repair Services',
                description: 'Expert smartphone and tablet repair with genuine parts, including display, battery, and charging port replacements. Fast and reliable service for all mobile devices.',
                imageUrl: 'images/phonerepair.jpg',
                features: [
                    'Screen replacement',
                    'Battery replacement',
                    'Charging port repair',
                    'Camera module replacement',
                    'Water damage repair',
                    'Software issues',
                    'Glass-only repairs',
                    'Original parts guarantee'
                ],
                price: 'Starting from Ksh. 600.00'
            }
        };

        this.init();
    }

    async init() {
        await this.initializeElements();
        await this.checkAuthState();
        await this.loadProducts();
        this.attachEventListeners();
    }

    initializeElements() {
        console.log('Initializing product gallery elements...');
        
        this.galleryGrid = document.getElementById('galleryGrid');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.imageCountElement = document.getElementById('imageCount');
        this.favoritesCountElement = document.getElementById('favoritesCount');
        this.searchInput = document.getElementById('searchInput');
        this.topSearchInput = document.getElementById('topSearchInput');
        this.searchToggle = document.getElementById('searchToggle');
        this.topSearchBar = document.getElementById('topSearchBar');
        this.searchClose = document.getElementById('searchClose');
        this.sortBtn = document.getElementById('sortBtn');
        this.sortDropdown = document.getElementById('sortDropdown');
        this.modal = document.getElementById('detailModal');
        this.modalBody = document.getElementById('modalBody');
        this.closeModal = document.getElementById('closeModal');
        this.cartBtn = document.getElementById('cartBtn');
        this.cartModal = document.getElementById('cartModal');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.closeCartModal = document.getElementById('closeCartModal');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.profileModal = document.getElementById('profileModal');
        this.closeProfileModal = document.getElementById('closeProfileModal');
        this.cancelProfileBtn = document.getElementById('cancelProfileBtn');
        this.profileForm = document.getElementById('profileForm');
        this.uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        this.profilePhotoInput = document.getElementById('profilePhotoInput');
        this.removePhotoBtn = document.getElementById('removePhotoBtn');
        this.checkoutModal = document.getElementById('checkoutModal');
        this.closeCheckoutModal = document.getElementById('closeCheckoutModal');
        this.cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
        this.checkoutForm = document.getElementById('checkoutForm');

        console.log('Gallery elements initialized');
    }

    async checkAuthState() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                await this.updateCartCount();
                await this.loadFavorites();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    async loadProducts() {
        console.log('Loading products...');
        
        try {
            // Try to load from Supabase
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('date_added', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                console.log('Loaded products from Supabase:', data.length);
                this.products = data.map(product => ({
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    imageUrl: product.image_url && product.image_url.length > 0 ? this.formatImageUrl(product.image_url[0]) : 'images/placeholder.jpg',
                    image_url: product.image_url ? product.image_url.map(url => this.formatImageUrl(url)) : [],
                    category: product.category,
                    price: `Ksh. ${parseFloat(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
                    rawPrice: parseFloat(product.price),
                    featured: product.featured,
                    new: product.new,
                    outOfStock: product.out_of_stock,
                    out_of_stock: product.out_of_stock,
                    features: product.features || [],
                    projectLink: product.project_link
                }));
            } else {
                console.log('No products in database, using fallback');
                // Fallback to local data
                this.products = await this.loadLocalProducts();
            }

            this.filteredProducts = [...this.products];
            this.renderGallery();
            this.updateProductCount();

        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to local data
            this.products = await this.loadLocalProducts();
            this.filteredProducts = [...this.products];
            this.renderGallery();
            this.updateProductCount();
        }
    }

    formatImageUrl(url) {
        if (!url) return 'images/placeholder.jpg';
        
        // If it's already a full URL, return as is
        if (url.startsWith('http')) {
            return url;
        }
        
        // If it's a local path, ensure it starts with images/
        if (url.startsWith('images/')) {
            return url;
        }
        
        // Add images/ prefix if it's just a filename
        return `images/${url}`;
    }

    async loadLocalProducts() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            return (data.gallery || []).map(product => ({
                ...product,
                imageUrl: this.formatImageUrl(product.imageUrl),
                image_url: product.image_url ? product.image_url.map(url => this.formatImageUrl(url)) : [this.formatImageUrl(product.imageUrl)],
                rawPrice: parseFloat(product.price.replace('Ksh. ', '').replace(',', '')) || 0
            }));
        } catch (error) {
            console.error('Error loading local products:', error);
            return [];
        }
    }

    async loadFavorites() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    product_id,
                    products (*)
                `)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            this.favoriteProducts = data?.map(item => ({
                id: item.products.id,
                title: item.products.title,
                description: item.products.description,
                imageUrl: item.products.image_url && item.products.image_url.length > 0 ? this.formatImageUrl(item.products.image_url[0]) : 'images/placeholder.jpg',
                image_url: item.products.image_url ? item.products.image_url.map(url => this.formatImageUrl(url)) : [],
                category: item.products.category,
                price: `Ksh. ${parseFloat(item.products.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
                rawPrice: parseFloat(item.products.price),
                featured: item.products.featured,
                new: item.products.new,
                outOfStock: item.products.out_of_stock,
                out_of_stock: item.products.out_of_stock,
                features: item.products.features || []
            })) || [];

            this.renderFavorites();
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    renderGallery() {
        console.log('Rendering gallery with', this.filteredProducts.length, 'products');
        
        if (!this.galleryGrid) {
            console.error('Gallery grid element not found!');
            return;
        }

        if (this.filteredProducts.length === 0) {
            this.galleryGrid.innerHTML = '<p class="no-results" style="text-align:center; grid-column:1/-1; padding:2rem; color:#888;">No products found matching your criteria.</p>';
            return;
        }

        this.galleryGrid.innerHTML = this.filteredProducts.map(product => {
            const isFavorited = this.favoriteProducts.some(fav => fav.id === product.id);
            
            return `
            <div class="gallery-item" data-id="${product.id}" data-category="${product.category}">
                ${product.out_of_stock ? '<div class="out-of-stock-label">Out of Stock</div>' : ''}
                ${product.new ? '<div class="new-tag">New</div>' : ''}
                <img src="${product.image_url ? product.image_url[0] : product.imageUrl}" alt="${product.title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
                <div class="item-info">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="item-meta">
                        <div class="meta-left">
                            <span class="category-tag">${this.formatCategory(product.category)}</span>
                            ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                        ${product.price ? `<span class="price-tag">${product.price}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="productGallery.addToCart('${product.id}')" 
                                ${product.out_of_stock ? 'disabled style="opacity:0.5;"' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-favorite ${isFavorited ? 'favorited' : ''}" onclick="productGallery.toggleFavorite('${product.id}')">
                            <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `}).join('');

        // Add click event to gallery items
        this.galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't open detail if clicking on action buttons
                if (!e.target.closest('.product-actions')) {
                    this.openProductDetail(item.dataset.id);
                }
            });
        });

        this.updateProductCount();
    }

    renderFavorites() {
        if (!this.favoritesGrid) return;

        if (this.favoriteProducts.length === 0) {
            this.favoritesGrid.innerHTML = '<p class="no-results" style="text-align:center; grid-column:1/-1; padding:2rem; color:#888;">You haven\'t added any products to favorites yet.</p>';
            if (this.favoritesCountElement) {
                this.favoritesCountElement.textContent = '0 favorite products';
            }
            return;
        }

        this.favoritesGrid.innerHTML = this.favoriteProducts.map(product => `
            <div class="gallery-item" data-id="${product.id}" data-category="${product.category}">
                ${product.out_of_stock ? '<div class="out-of-stock-label">Out of Stock</div>' : ''}
                ${product.new ? '<div class="new-tag">New</div>' : ''}
                <img src="${product.image_url ? product.image_url[0] : product.imageUrl}" alt="${product.title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
                <div class="item-info">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="item-meta">
                        <div class="meta-left">
                            <span class="category-tag">${this.formatCategory(product.category)}</span>
                            ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                        ${product.price ? `<span class="price-tag">${product.price}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="productGallery.addToCart('${product.id}')" 
                                ${product.out_of_stock ? 'disabled style="opacity:0.5;"' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-favorite favorited" onclick="productGallery.toggleFavorite('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event to favorite items
        this.favoritesGrid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    this.openProductDetail(item.dataset.id);
                }
            });
        });

        if (this.favoritesCountElement) {
            this.favoritesCountElement.textContent = `${this.favoriteProducts.length} favorite product${this.favoriteProducts.length !== 1 ? 's' : ''}`;
        }
    }

    formatCategory(category) {
        const categoryMap = {
            'pcb-design': 'PCB Design',
            'etching': 'Etching',
            'fabrication': 'Fabrication',
            'laptop-repair': 'Laptop Repair',
            'mobile-repair': 'Mobile Repair',
            'electronic-components': 'Components',
            'electronics-gadgets': 'Gadgets',
            'diy-modules': 'DIY Modules',
            'oraimo-products': 'Oraimo',
            'laptops': 'Laptops',
            'tools': 'Tools'
        };
        return categoryMap[category] || category;
    }

    openServiceDetail(serviceId) {
        const service = this.services[serviceId];
        if (!service) return;

        const modalContent = `
            <div class="service-detail">
                <div class="detail-image">
                    <img src="${service.imageUrl}" alt="${service.title}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="detail-info">
                    <h2 class="detail-title">${service.title}</h2>
                    <p class="detail-description">${service.description}</p>
                    
                    <div class="detail-features">
                        <h4>Service Features:</h4>
                        <ul>
                            ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-meta">
                        <span class="detail-price">${service.price}</span>
                    </div>
                    
                    <div class="detail-actions">
                        <a href="#contact" class="detail-contact-btn">
                            <i class="fas fa-phone"></i> Contact for Quote
                        </a>
                        <button class="detail-close-btn">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.modalBody.innerHTML = modalContent;
        this.modal.classList.add('show');

        // Add event listener to contact button
        const contactBtn = this.modalBody.querySelector('.detail-contact-btn');
        const closeBtn = this.modalBody.querySelector('.detail-close-btn');

        if (contactBtn) {
            contactBtn.onclick = (e) => {
                e.preventDefault();
                this.closeDetailModal();
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            };
        }

        if (closeBtn) {
            closeBtn.onclick = () => this.closeDetailModal();
        }
    }

    async openProductDetail(productId) {
        const product = this.products.find(prod => prod.id === productId);
        if (!product) return;

        // Check if product is favorited
        let isFavorited = false;
        if (this.currentUser) {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .eq('product_id', productId)
                .single();
            isFavorited = !!data;
        }

        const modalContent = `
            <div class="product-detail">
                <div class="detail-image">
                    <img src="${product.image_url ? product.image_url[0] : product.imageUrl}" alt="${product.description}" onerror="this.src='images/placeholder.jpg'">
                    ${product.image_url && product.image_url.length > 1 ? `
                        <div class="image-thumbnails">
                            ${product.image_url.map((img, index) => `
                                <img src="${img}" alt="${product.title} ${index + 1}" onclick="this.closest('.detail-image').querySelector('img').src='${img}'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="detail-info">
                    <h2 class="detail-title">${product.title}</h2>
                    <p class="detail-description">${product.description}</p>
                    
                    <div class="detail-badges">
                        ${product.featured ? '<span class="detail-badge featured">Featured</span>' : ''}
                        ${product.new ? '<span class="detail-badge new">New Arrival</span>' : ''}
                        ${product.out_of_stock || product.outOfStock ? '<span class="detail-badge out-of-stock">Out of Stock</span>' : ''}
                    </div>
                    
                    <div class="detail-meta">
                        ${product.price ? `<span class="detail-price">${product.price}</span>` : ''}
                        <span class="detail-category">${this.formatCategory(product.category)}</span>
                    </div>
                    
                    ${product.features && product.features.length > 0 ? `
                    <div class="detail-features">
                        <h4>Product Features:</h4>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${product.projectLink ? `
                    <div class="project-link-section">
                        <h4>Project Details:</h4>
                        <a href="${product.projectLink}" target="_blank" class="project-link-btn">
                            <i class="fas fa-external-link-alt"></i> View Project Documentation
                        </a>
                    </div>
                    ` : ''}
                    
                    <div class="detail-actions">
                        ${!(product.out_of_stock || product.outOfStock) ? `
                        <button class="detail-contact-btn" onclick="productGallery.addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        ` : ''}
                        <button class="btn-favorite ${isFavorited ? 'favorited' : ''}" onclick="productGallery.toggleFavorite('${product.id}')">
                            <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button class="detail-close-btn">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.modalBody.innerHTML = modalContent;
        this.modal.classList.add('show');

        // Add event listeners to buttons
        const closeBtn = this.modalBody.querySelector('.detail-close-btn');
        closeBtn.onclick = () => this.closeDetailModal();
    }

    closeDetailModal() {
        this.modal.classList.remove('show');
    }

    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            let matchesFilter = false;

            if (this.currentFilter === 'all') {
                matchesFilter = true;
            } else if (this.currentFilter === 'featured') {
                matchesFilter = product.featured;
            } else if (this.currentFilter === 'out-of-stock') {
                matchesFilter = product.out_of_stock || product.outOfStock;
            } else if (this.currentFilter === 'new') {
                matchesFilter = product.new === true;
            } else if (this.currentFilter === 'tools') {
                // Define which products belong to tools category
                const toolKeywords = ['soldering', 'glue', 'solder', 'iron', 'gun', 'heat', 'tool'];
                const title = product.title.toLowerCase();
                matchesFilter = toolKeywords.some(keyword => title.includes(keyword));
            } else {
                matchesFilter = product.category === this.currentFilter;
            }

            const matchesSearch = !this.searchTerm ||
                product.title.toLowerCase().includes(this.searchTerm) ||
                product.description.toLowerCase().includes(this.searchTerm) ||
                product.category.toLowerCase().includes(this.searchTerm);

            return matchesFilter && matchesSearch;
        });

        this.sortProducts();
        this.renderGallery();
    }

    sortProducts() {
        if (!this.filteredProducts.length) return;

        switch (this.currentSort) {
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => this.extractPrice(b) - this.extractPrice(a));
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => this.extractPrice(a) - this.extractPrice(b));
                break;
            default:
                // Default sort by name ascending
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        this.renderGallery();
    }

    extractPrice(product) {
        if (product.rawPrice) return product.rawPrice;
        if (!product.price) return 0;
        // Extract numeric value from price string like "Ksh. 250.00"
        const priceMatch = product.price.toString().match(/(\d+\.?\d*)/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    }

    updateProductCount() {
        if (this.imageCountElement) {
            const count = this.filteredProducts.length;
            this.imageCountElement.textContent = `${count} product${count !== 1 ? 's' : ''}`;
        }
    }

    // Cart functionality
    async addToCart(productId) {
        if (!this.currentUser) {
            this.showNotification('Please sign in to add items to cart');
            window.location.href = 'auth.html';
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (product.out_of_stock || product.outOfStock) {
            this.showNotification('This product is out of stock');
            return;
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .upsert([
                    { 
                        user_id: this.currentUser.id, 
                        product_id: productId,
                        quantity: 1
                    }
                ], {
                    onConflict: 'user_id,product_id'
                });

            if (error) throw error;

            this.showNotification('Product added to cart!');
            this.updateCartCount();
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding product to cart');
        }
    }

    async removeFromCart(productId) {
        if (!this.currentUser) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', this.currentUser.id)
                .eq('product_id', productId);

            if (error) throw error;

            this.showNotification('Product removed from cart');
            await this.loadCart();
            this.updateCartCount();
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Error removing product from cart', 'error');
        }
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            await this.removeFromCart(productId);
            return;
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('user_id', this.currentUser.id)
                .eq('product_id', productId);

            if (error) throw error;

            await this.loadCart();
            this.updateCartCount();
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showNotification('Error updating quantity', 'error');
        }
    }

    async updateCartCount() {
        if (!this.currentUser) {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) cartCount.textContent = '0';
            return;
        }

        try {
            const { count } = await supabase
                .from('cart_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.currentUser.id);

            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = count || 0;
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    async openCart() {
        if (!this.currentUser) {
            this.showNotification('Please sign in to view cart');
            window.location.href = 'auth.html';
            return;
        }

        try {
            await this.loadCart();
            this.cartModal.classList.add('show');
        } catch (error) {
            console.error('Error opening cart:', error);
            this.showNotification('Error loading cart', 'error');
        }
    }

    async loadCart() {
        if (!this.currentUser || !this.cartItems) {
            if (this.cartItems) {
                this.cartItems.innerHTML = '<p>Please sign in to view your cart</p>';
            }
            return;
        }

        try {
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    quantity,
                    products (*)
                `)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            if (!cartItems || cartItems.length === 0) {
                this.cartItems.innerHTML = '<p>Your cart is empty</p>';
                if (this.cartTotal) {
                    this.cartTotal.textContent = '0.00';
                }
                return;
            }

            let total = 0;
            this.cartItems.innerHTML = cartItems.map(item => {
                const product = item.products;
                const price = this.extractPrice(product);
                const itemTotal = price * item.quantity;
                total += itemTotal;

                return `
                    <div class="cart-item">
                        <img src="${product.image_url && product.image_url.length > 0 ? product.image_url[0] : (product.imageUrl || 'images/placeholder.jpg')}" 
                             alt="${product.title}" 
                             onerror="this.src='images/placeholder.jpg'">
                        <div class="cart-item-info">
                            <h4>${product.title}</h4>
                            <p class="cart-item-price">Ksh. ${price.toFixed(2)}</p>
                            <div class="cart-item-controls">
                                <button onclick="productGallery.updateQuantity('${product.id}', ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="productGallery.updateQuantity('${product.id}', ${item.quantity + 1})">+</button>
                                <button class="remove-btn" onclick="productGallery.removeFromCart('${product.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            if (this.cartTotal) {
                this.cartTotal.textContent = total.toFixed(2);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            if (this.cartItems) {
                this.cartItems.innerHTML = '<p>Error loading cart items</p>';
            }
        }
    }

    closeCart() {
        this.cartModal.classList.remove('show');
    }

    async checkout() {
        if (!this.currentUser) return;

        // Load cart items to display in checkout
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
                quantity,
                products (*)
            `)
            .eq('user_id', this.currentUser.id);

        if (!cartItems || cartItems.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        // Show checkout modal
        this.checkoutModal.classList.add('show');
    }

    async processCheckout(formData) {
        try {
            // Get cart items
            const { data: cartItems } = await supabase
                .from('cart_items')
                .select(`
                    quantity,
                    products (*)
                `)
                .eq('user_id', this.currentUser.id);

            if (!cartItems || cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Create order summary
            const orderSummary = cartItems.map(item => 
                `${item.products.title} - Quantity: ${item.quantity} - Price: Ksh. ${(this.extractPrice(item.products) * item.quantity).toFixed(2)}`
            ).join('\n');

            const totalAmount = cartItems.reduce((sum, item) => 
                sum + (this.extractPrice(item.products) * item.quantity), 0
            );

            // Send email notification (simulated)
            await this.sendOrderEmail(formData, orderSummary, totalAmount);

            // Clear cart
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', this.currentUser.id);

            this.showNotification('Order placed successfully! We will contact you soon.', 'success');
            this.closeCheckoutModal();
            this.closeCart();
            this.updateCartCount();

        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification('Error processing order: ' + error.message, 'error');
        }
    }

    async sendOrderEmail(customerData, orderSummary, totalAmount) {
        // This is a simplified version - in production, you'd use a backend service
        console.log('Order Details:', {
            customer: customerData,
            orderSummary: orderSummary,
            totalAmount: totalAmount
        });

        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll just log the order
        console.log('Order would be sent to: mentoraelectric@gmail.com');
        console.log('Order details:', {
            customer: customerData,
            items: orderSummary,
            total: totalAmount
        });
        
        return true;
    }

    closeCheckoutModal() {
        this.checkoutModal.classList.remove('show');
        this.checkoutForm.reset();
    }

    // Favorites functionality
    async toggleFavorite(productId) {
        if (!this.currentUser) {
            this.showNotification('Please sign in to add favorites');
            window.location.href = 'auth.html';
            return;
        }

        try {
            // Check if already favorited
            const { data: existing } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .eq('product_id', productId)
                .single();

            if (existing) {
                // Remove favorite
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', existing.id);
                this.showNotification('Removed from favorites');
            } else {
                // Add favorite
                await supabase
                    .from('favorites')
                    .insert([
                        { user_id: this.currentUser.id, product_id: productId }
                    ]);
                this.showNotification('Added to favorites!');
            }

            // Update UI
            await this.loadFavorites();
            this.updateFavoriteUI(productId, !existing);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showNotification('Error updating favorites', 'error');
        }
    }

    updateFavoriteUI(productId, isFavorited) {
        // Update favorite buttons in gallery
        const favoriteBtns = document.querySelectorAll(`[onclick*="${productId}"]`);
        favoriteBtns.forEach(btn => {
            if (btn.classList.contains('btn-favorite')) {
                btn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>`;
                btn.classList.toggle('favorited', isFavorited);
            }
        });
    }

    // Profile functionality
    async updateProfile(profileData) {
        if (!this.currentUser) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    username: profileData.username,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Update current user data
            this.currentUser.username = profileData.username;
            this.updateUI();
            
            this.showNotification('Profile updated successfully!');
            this.closeProfileModal();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error updating profile', 'error');
        }
    }

    async uploadProfilePhoto(file) {
        if (!this.currentUser) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/avatar.${fileExt}`;

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(fileName);

            // Update user profile with photo URL
            const { error: updateError } = await supabase
                .from('users')
                .update({ profile_photo: publicUrl })
                .eq('id', this.currentUser.id);

            if (updateError) throw updateError;

            // Update current user data
            this.currentUser.profile_photo = publicUrl;
            this.updateUI();

            this.showNotification('Profile photo updated successfully!');
            return publicUrl;
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            this.showNotification('Error uploading profile photo', 'error');
            throw error;
        }
    }

    async removeProfilePhoto() {
        if (!this.currentUser || !this.currentUser.profile_photo) return;

        try {
            // Extract filename from URL
            const urlParts = this.currentUser.profile_photo.split('/');
            const fileName = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

            // Delete file from storage
            const { error: deleteError } = await supabase.storage
                .from('profile-photos')
                .remove([fileName]);

            if (deleteError) throw deleteError;

            // Update user profile
            const { error: updateError } = await supabase
                .from('users')
                .update({ profile_photo: null })
                .eq('id', this.currentUser.id);

            if (updateError) throw updateError;

            // Update current user data
            this.currentUser.profile_photo = null;
            this.updateUI();

            this.showNotification('Profile photo removed successfully!');
        } catch (error) {
            console.error('Error removing profile photo:', error);
            this.showNotification('Error removing profile photo', 'error');
        }
    }

    openProfileModal() {
        if (!this.currentUser) return;
        
        const usernameInput = document.getElementById('profileUsername');
        const emailInput = document.getElementById('profileEmail');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        const profilePhotoPlaceholder = document.getElementById('profilePhotoPlaceholder');
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        if (this.currentUser) {
            usernameInput.value = this.currentUser.username || '';
            emailInput.value = this.currentUser.email || '';

            // Load profile photo
            if (this.currentUser.profile_photo) {
                profilePhotoPreview.src = this.currentUser.profile_photo;
                profilePhotoPreview.style.display = 'block';
                profilePhotoPlaceholder.style.display = 'none';
                removePhotoBtn.style.display = 'block';
            } else {
                profilePhotoPreview.style.display = 'none';
                profilePhotoPlaceholder.style.display = 'flex';
                removePhotoBtn.style.display = 'none';
            }

            this.profileModal.classList.add('show');
        }
    }

    closeProfileModal() {
        this.profileModal.classList.remove('show');
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    attachEventListeners() {
        console.log('Attaching gallery event listeners...');
        
        // Filter buttons
        document.querySelectorAll('.gallery-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gallery-nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterProducts();
            });
        });

        // Service cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const serviceId = card.dataset.service;
                this.openServiceDetail(serviceId);
            });
        });

        // Service links in footer
        document.querySelectorAll('.service-modal-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const serviceId = link.dataset.service;
                this.openServiceDetail(serviceId);
            });
        });

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.filterProducts();
            });
        }

        // Top search toggle
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => {
                this.topSearchBar.classList.toggle('show');
                if (this.topSearchBar.classList.contains('show')) {
                    this.topSearchInput.focus();
                }
            });
        }

        // Search close button
        if (this.searchClose) {
            this.searchClose.addEventListener('click', () => {
                this.topSearchBar.classList.remove('show');
            });
        }

        // Top search input
        if (this.topSearchInput) {
            this.topSearchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                if (this.searchInput) {
                    this.searchInput.value = e.target.value;
                }
                this.filterProducts();
            });
        }

        // Sort button
        if (this.sortBtn) {
            this.sortBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sortDropdown.classList.toggle('show');
            });
        }

        // Sort options
        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentSort = e.target.dataset.sort;
                this.sortBtn.innerHTML = `<i class="fas fa-sort"></i> ${e.target.textContent}`;
                this.sortDropdown.classList.remove('show');
                this.filterProducts();
            });
        });

        // Close sort dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.sortBtn?.contains(e.target) && !this.sortDropdown?.contains(e.target)) {
                this.sortDropdown?.classList.remove('show');
            }
        });

        // Cart functionality
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', () => this.openCart());
        }

        if (this.closeCartModal) {
            this.closeCartModal.addEventListener('click', () => this.closeCart());
        }

        if (this.closeCartBtn) {
            this.closeCartBtn.addEventListener('click', () => this.closeCart());
        }

        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Modal close
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.closeDetailModal());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeDetailModal();
            });
        }

        // Profile functionality
        if (this.closeProfileModal) {
            this.closeProfileModal.addEventListener('click', () => this.closeProfileModal());
        }

        if (this.cancelProfileBtn) {
            this.cancelProfileBtn.addEventListener('click', () => this.closeProfileModal());
        }

        if (this.profileForm) {
            this.profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(this.profileForm);
                await this.updateProfile({
                    username: formData.get('username')
                });
            });
        }

        if (this.uploadPhotoBtn) {
            this.uploadPhotoBtn.addEventListener('click', () => {
                this.profilePhotoInput.click();
            });
        }

        if (this.profilePhotoInput) {
            this.profilePhotoInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.uploadProfilePhoto(file);
                }
            });
        }

        if (this.removePhotoBtn) {
            this.removePhotoBtn.addEventListener('click', async () => {
                await this.removeProfilePhoto();
            });
        }

        // Checkout functionality - FIXED EVENT LISTENERS
        if (this.closeCheckoutModal) {
            this.closeCheckoutModal.addEventListener('click', () => {
                this.checkoutModal.classList.remove('show');
            });
        }

        if (this.cancelCheckoutBtn) {
            this.cancelCheckoutBtn.addEventListener('click', () => {
                this.checkoutModal.classList.remove('show');
            });
        }

        if (this.checkoutForm) {
            this.checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('customerName').value,
                    email: document.getElementById('customerEmail').value,
                    phone: document.getElementById('customerPhone').value,
                    address: document.getElementById('customerAddress').value
                };
                await this.processCheckout(formData);
            });
        }

        // Close checkout modal when clicking outside
        if (this.checkoutModal) {
            this.checkoutModal.addEventListener('click', (e) => {
                if (e.target === this.checkoutModal) {
                    this.checkoutModal.classList.remove('show');
                }
            });
        }

        // User dropdown
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }

        // Logout button - FIXED FOR NORMAL USERS
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    this.currentUser = null;
                    this.updateAuthUI();
                    this.updateCartCount();
                    this.showNotification('Logged out successfully');
                    window.location.href = 'index.html';
                }
            });
        }

        // Profile link
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProfileModal();
            });
        }

        // Favorites link
        const favoritesLink = document.getElementById('favoritesLink');
        if (favoritesLink) {
            favoritesLink.addEventListener('click', (e) => {
                e.preventDefault();
                const favoritesSection = document.getElementById('favorites');
                if (favoritesSection) {
                    favoritesSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDetailModal();
                this.closeCart();
                this.closeProfileModal();
                this.checkoutModal.classList.remove('show');
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                if (!this.classList.contains('service-modal-link')) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        console.log('Gallery event listeners attached');
    }

    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const usernameDisplay = document.getElementById('usernameDisplay');
        const adminLink = document.getElementById('adminLink');
        const favoritesNavLink = document.getElementById('favoritesNavLink');
        const favoritesSection = document.getElementById('favorites');

        if (this.currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = this.currentUser.username || this.currentUser.email;
            if (favoritesNavLink) favoritesNavLink.style.display = 'flex';
            if (favoritesSection) favoritesSection.style.display = 'block';
            if (adminLink) {
                adminLink.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
            }
        } else {
            if (authButtons) authButtons.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (favoritesNavLink) favoritesNavLink.style.display = 'none';
            if (favoritesSection) favoritesSection.style.display = 'none';
        }
    }
}

// Initialize when everything is ready
let productGallery;
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing ProductGallery...');
    productGallery = new ProductGallery();
});
