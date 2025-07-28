/**
 * ==========================================================================
 * FRESH JUICE SHOP — CLIENT INTERACTION SCRIPT
 * Vanilla JavaScript (ES6+) for responsive navigation, order flow,
 * menu search & filter, gallery lightbox, and form validation.
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   1. EDITABLE STORE CONFIGURATION
   Update these variables to connect to your real shop details.
   ========================================================================== */
const STORE_CONFIG = {
    // WhatsApp number for order dispatch (Format: international code without + or spaces)
    // Replace with your real business WhatsApp number (e.g., "15552345678" or "919876543210")
    whatsappNumber: "15552345678",
    
    // Store contact placeholders
    storeName: "Fresh Juice Shop",
    storeEmail: "hello@freshjuiceshop.com",
    storePhone: "+1 (555) 234-5678",
    storeAddress: "123 Fresh Orchard Lane, Green Valley, CA 94016",

    // Currency and Live Exchange Rate Configuration
    currency: {
        code: "INR",
        symbol: "₹",
        fallbackExchangeRate: 95.0, // Configured fallback rate: ₹95 per USD
        apiEndpoints: [
            "https://open.er-api.com/v6/latest/USD",
            "https://api.frankfurter.dev/v1/latest?from=USD&to=INR"
        ],
        cacheKey: "fjs_usd_to_inr_exchange_rate",
        cacheExpiryMs: 3600000 // Cache for 1 hour (3600000 ms)
    }
};

/* ==========================================================================
   2. CURRENCY CONVERSION & LIVE EXCHANGE RATE LOGIC
   Converts original USD prices to Indian Rupees (₹) dynamically at runtime.
   Original prices in source data attributes (data-price) remain unchanged.
   ========================================================================== */
let currentExchangeRate = STORE_CONFIG.currency.fallbackExchangeRate;

/**
 * Formats a given USD price into Indian Rupees (INR) using Indian numbering locale format.
 * Formula: INR price = USD price * USD-to-INR exchange rate
 * @param {number|string} usdAmount - Original price in USD
 * @returns {string} Formatted Indian Rupee string, e.g. "₹427.50"
 */
function formatPriceINR(usdAmount) {
    const numericUSD = typeof usdAmount === 'number' ? usdAmount : parseFloat(usdAmount) || 0;
    const inrValue = numericUSD * currentExchangeRate;
    return '₹' + inrValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Updates all rendered product prices, order button aria labels,
 * and customization options across the page to INR.
 * Original product prices stored in source data (data-price, data-extra) are never altered.
 */
function renderAllPricesInINR() {
    // 1. Menu card prices
    document.querySelectorAll('.product-price[data-price]').forEach(priceEl => {
        const usdPrice = priceEl.getAttribute('data-price');
        if (usdPrice) {
            priceEl.textContent = formatPriceINR(usdPrice);
        }
    });

    // 2. Order buttons' accessible aria labels
    document.querySelectorAll('.order-btn[data-price]').forEach(btn => {
        const usdPrice = btn.getAttribute('data-price');
        const name = btn.getAttribute('data-name') || 'Juice';
        if (usdPrice) {
            btn.setAttribute('aria-label', `Order ${name} for ${formatPriceINR(usdPrice)}`);
        }
    });

    // 3. Size option extra labels in the customization modal
    document.querySelectorAll('.size-card').forEach(card => {
        const radio = card.querySelector('input[name="order-size"]');
        const extraSpan = card.querySelector('.size-extra');
        if (radio && extraSpan) {
            const extraUSD = parseFloat(radio.getAttribute('data-extra')) || 0;
            if (extraUSD === 0) {
                extraSpan.textContent = 'Included';
            } else {
                extraSpan.textContent = `+${formatPriceINR(extraUSD)}`;
            }
        }
    });
}

/**
 * Fetches the latest USD to INR exchange rate from reliable open APIs,
 * caching results in localStorage and falling back cleanly to the configured rate on errors.
 */
async function initCurrencyAndExchangeRate() {
    // Render immediately using either cached rate or configured fallback
    try {
        const cached = localStorage.getItem(STORE_CONFIG.currency.cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.rate && !isNaN(parsed.rate) && parsed.rate > 0) {
                currentExchangeRate = parseFloat(parsed.rate);
                renderAllPricesInINR();
                // If cache is fresh (< 1 hour), skip network request
                if (Date.now() - parsed.timestamp < STORE_CONFIG.currency.cacheExpiryMs) {
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('Could not read cached exchange rate:', e);
    }

    // Attempt live API fetch with timeout and fallback endpoints
    let fetchedRate = null;
    for (const endpoint of STORE_CONFIG.currency.apiEndpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(endpoint, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && data.rates && data.rates.INR) {
                    fetchedRate = parseFloat(data.rates.INR);
                    if (!isNaN(fetchedRate) && fetchedRate > 0) {
                        break;
                    }
                }
            }
        } catch (err) {
            console.warn(`Exchange rate fetch failed for ${endpoint}:`, err);
        }
    }

    if (fetchedRate && !isNaN(fetchedRate) && fetchedRate > 0) {
        currentExchangeRate = fetchedRate;
        try {
            localStorage.setItem(STORE_CONFIG.currency.cacheKey, JSON.stringify({
                rate: currentExchangeRate,
                timestamp: Date.now()
            }));
        } catch (e) {}
    } else {
        console.info(`Using configured fallback exchange rate: ₹${currentExchangeRate.toFixed(2)} per USD`);
    }

    renderAllPricesInINR();
}

/* ==========================================================================
   3. DOM READY INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initCurrencyAndExchangeRate();
    initNavigation();
    initScrollEffects();
    initMenuFilterAndSearch();
    initOrderModal();
    initGalleryLightbox();
    initContactForm();
    initPolicyModal();
    initCurrentYear();
});

/* ==========================================================================
   3. RESPONSIVE NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
    const menuOpenBtn = document.getElementById('menu-open-button');
    const menuCloseBtn = document.getElementById('menu-close-button');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link, .nav-menu .nav-cta');

    if (!menuOpenBtn || !navMenu) return;

    function openMobileMenu() {
        navMenu.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');
        menuOpenBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        if (menuCloseBtn) menuCloseBtn.focus();
    }

    function closeMobileMenu() {
        navMenu.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        menuOpenBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuOpenBtn.focus();
    }

    menuOpenBtn.addEventListener('click', openMobileMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobileMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

    // Auto close menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

/* ==========================================================================
   4. SCROLL EFFECTS & ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initScrollEffects() {
    const header = document.getElementById('site-header');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // Sticky header styling
        if (header) {
            if (scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Active Section Highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSectionId && link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Back to top click handler
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   5. MENU FILTERING & SEARCH
   ========================================================================== */
function initMenuFilterAndSearch() {
    const filterBtns = document.querySelectorAll('.category-filters .filter-btn');
    const menuItems = document.querySelectorAll('#menu-grid .menu-item');
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const noResults = document.getElementById('no-results-msg');
    const resetBtn = document.getElementById('reset-filter-btn');

    if (!menuItems.length) return;

    let currentCategory = 'all';
    let currentSearchTerm = '';

    function applyFilterAndSearch() {
        let visibleCount = 0;

        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category') || '';
            const itemName = (item.getAttribute('data-name') || '').toLowerCase();
            const itemDesc = (item.querySelector('.product-desc')?.textContent || '').toLowerCase();

            const matchesCategory = (currentCategory === 'all' || itemCategory === currentCategory);
            const matchesSearch = !currentSearchTerm || 
                                  itemName.includes(currentSearchTerm) || 
                                  itemDesc.includes(currentSearchTerm);

            if (matchesCategory && matchesSearch) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Category button click
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            currentCategory = btn.getAttribute('data-category') || 'all';
            applyFilterAndSearch();
        });
    });

    // Search input typing
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim().toLowerCase();
            if (clearBtn) {
                clearBtn.style.display = currentSearchTerm ? 'block' : 'none';
            }
            applyFilterAndSearch();
        });
    }

    // Clear search button
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            clearBtn.style.display = 'none';
            searchInput.focus();
            applyFilterAndSearch();
        });
    }

    // Reset filters from empty state
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                currentSearchTerm = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
                if (b.getAttribute('data-category') === 'all') {
                    b.classList.add('active');
                    b.setAttribute('aria-selected', 'true');
                }
            });
            currentCategory = 'all';
            applyFilterAndSearch();
        });
    }
}

/* ==========================================================================
   6. INTERACTIVE ORDER MODAL & WHATSAPP INTEGRATION
   ========================================================================== */
function initOrderModal() {
    const modal = document.getElementById('order-modal');
    const closeBtn = document.getElementById('order-modal-close');
    const orderBtns = document.querySelectorAll('.order-btn, .nav-cta, .desktop-order-btn');

    // Modal elements
    const prodThumb = document.getElementById('order-product-image');
    const prodName = document.getElementById('order-product-name');
    const basePriceDisplay = document.getElementById('order-base-price');
    const sizeRadios = document.querySelectorAll('input[name="order-size"]');
    const sizeCards = document.querySelectorAll('.size-card');
    const sweetnessSelect = document.getElementById('order-sweetness');
    const iceSelect = document.getElementById('order-ice');
    const qtyMinusBtn = document.getElementById('qty-minus-btn');
    const qtyPlusBtn = document.getElementById('qty-plus-btn');
    const qtyDisplay = document.getElementById('order-quantity');
    const totalPriceDisplay = document.getElementById('order-total-price');
    const customerNameInput = document.getElementById('order-customer-name');
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    const pickupBtn = document.getElementById('pickup-order-btn');
    const statusMsg = document.getElementById('order-status-msg');

    if (!modal) return;

    let currentItem = {
        name: "Strawberry Juice",
        basePrice: 4.50,
        image: "Assets/berry.jpg"
    };

    let quantity = 1;
    let sizeExtra = 0;
    let selectedSizeLabel = "Regular (350ml)";

    function updateTotalPrice() {
        const unitPrice = currentItem.basePrice + sizeExtra;
        const total = (unitPrice * quantity).toFixed(2);
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = `$${total}`;
        }
        return total;
    }

    function openModalWithProduct(name, price, image) {
        currentItem.name = name || "Fresh Artisan Juice";
        currentItem.basePrice = parseFloat(price) || 4.50;
        currentItem.image = image || "Assets/berry.jpg";

        if (prodName) prodName.textContent = currentItem.name;
        if (prodThumb) prodThumb.src = currentItem.image;
        if (basePriceDisplay) basePriceDisplay.textContent = `$${currentItem.basePrice.toFixed(2)}`;

        // Reset customization defaults
        quantity = 1;
        sizeExtra = 0;
        selectedSizeLabel = "Regular (350ml)";
        if (qtyDisplay) qtyDisplay.textContent = '1';
        
        sizeCards.forEach(card => card.classList.remove('active'));
        const defaultRadio = document.querySelector('input[name="order-size"][value="regular"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            defaultRadio.closest('.size-card')?.classList.add('active');
        }

        if (sweetnessSelect) sweetnessSelect.selectedIndex = 0;
        if (iceSelect) iceSelect.selectedIndex = 0;
        if (customerNameInput) customerNameInput.value = '';
        if (statusMsg) {
            statusMsg.style.display = 'none';
            statusMsg.textContent = '';
        }

        updateTotalPrice();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Attach open triggers
    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const image = btn.getAttribute('data-image');

            if (name && price) {
                e.preventDefault();
                openModalWithProduct(name, price, image);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Click on backdrop to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Size Selection
    sizeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            sizeCards.forEach(c => c.classList.remove('active'));
            radio.closest('.size-card')?.classList.add('active');
            sizeExtra = parseFloat(radio.getAttribute('data-extra')) || 0;
            const title = radio.closest('.size-card')?.querySelector('.size-title')?.textContent || '';
            const detail = radio.closest('.size-card')?.querySelector('.size-detail')?.textContent || '';
            selectedSizeLabel = `${title} (${detail})`;
            updateTotalPrice();
        });
    });

    // Quantity Counter
    if (qtyMinusBtn && qtyPlusBtn && qtyDisplay) {
        qtyMinusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                qtyDisplay.textContent = quantity;
                updateTotalPrice();
            }
        });

        qtyPlusBtn.addEventListener('click', () => {
            if (quantity < 20) {
                quantity++;
                qtyDisplay.textContent = quantity;
                updateTotalPrice();
            }
        });
    }

    // WhatsApp Dispatch
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const total = updateTotalPrice();
            const customer = customerNameInput?.value.trim() || 'A fresh juice enthusiast';
            const sweetness = sweetnessSelect ? sweetnessSelect.value : '100% Pure Natural';
            const ice = iceSelect ? iceSelect.value : 'Regular Ice';

            const message = `Hello ${STORE_CONFIG.storeName}! 🍹\n\nI'd like to place a fresh juice order:\n\n` +
                            `• Item: ${currentItem.name}\n` +
                            `• Quantity: ${quantity}\n` +
                            `• Size: ${selectedSizeLabel}\n` +
                            `• Sweetness: ${sweetness}\n` +
                            `• Ice Level: ${ice}\n` +
                            `• Total Price: $${total}\n` +
                            `• Customer Name: ${customer}\n\n` +
                            `Please confirm order availability and preparation time. Thank you!`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMessage}`;

            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

            if (statusMsg) {
                statusMsg.style.display = 'block';
                statusMsg.className = 'order-status-banner';
                statusMsg.innerHTML = `<i class="fa-brands fa-whatsapp"></i> <strong>WhatsApp opened!</strong> Your order message has been prepared for dispatch to <code>+${STORE_CONFIG.whatsappNumber}</code>.`;
            }
        });
    }

    // Counter Pickup Request
    if (pickupBtn) {
        pickupBtn.addEventListener('click', () => {
            const customer = customerNameInput?.value.trim() || 'Customer';
            const total = updateTotalPrice();

            if (statusMsg) {
                statusMsg.style.display = 'block';
                statusMsg.className = 'order-status-banner';
                statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Order Request Prepared for ${escapeHtml(customer)}!</strong><br>` +
                                      `Total: <strong>$${total}</strong> (${quantity}x ${escapeHtml(currentItem.name)}, ${escapeHtml(selectedSizeLabel)}).<br>` +
                                      `<small style="display:block; margin-top:6px; opacity:0.85;">(In live production, this transmits to your point-of-sale system or kitchen display.)</small>`;
            }
        });
    }
}

/* ==========================================================================
   7. GALLERY LIGHTBOX MODAL
   ========================================================================== */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    if (!galleryItems.length || !lightbox || !lightboxImg) return;

    let currentIndex = 0;
    const itemsData = [];

    galleryItems.forEach((item, index) => {
        const img = item.querySelector('.gallery-image');
        const caption = item.getAttribute('data-caption') || img?.alt || 'Juice Bar Moment';
        const src = img?.getAttribute('src') || '';

        itemsData.push({ src, caption });

        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View full size image: ${caption}`);

        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    function updateLightboxContent(index) {
        currentIndex = (index + itemsData.length) % itemsData.length;
        const current = itemsData[currentIndex];
        lightboxImg.src = current.src;
        lightboxImg.alt = current.caption;
        if (lightboxCaption) lightboxCaption.textContent = current.caption;
    }

    function openLightbox(index) {
        updateLightboxContent(index);
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => updateLightboxContent(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateLightboxContent(currentIndex + 1));

    // Backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation (Escape, Left, Right)
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') updateLightboxContent(currentIndex - 1);
            if (e.key === 'ArrowRight') updateLightboxContent(currentIndex + 1);
        }
    });
}

/* ==========================================================================
   8. CONTACT FORM VALIDATION & FEEDBACK
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const feedbackBox = document.getElementById('form-feedback');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackMsg = document.getElementById('feedback-message');
    const resetFormBtn = document.getElementById('reset-form-btn');

    if (!form) return;

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setFieldError(input, hasError) {
        const group = input.closest('.form-group');
        if (group) {
            if (hasError) {
                group.classList.add('has-error');
            } else {
                group.classList.remove('has-error');
            }
        }
    }

    // Real-time error removal on input
    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                setFieldError(input, false);
            });
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        // Name Validation
        if (!nameInput || nameInput.value.trim().length < 2) {
            if (nameInput) setFieldError(nameInput, true);
            isValid = false;
        }

        // Email Validation
        if (!emailInput || !validateEmail(emailInput.value.trim())) {
            if (emailInput) setFieldError(emailInput, true);
            isValid = false;
        }

        // Message Validation
        if (!messageInput || messageInput.value.trim().length < 10) {
            if (messageInput) setFieldError(messageInput, true);
            isValid = false;
        }

        if (isValid) {
            const userName = nameInput.value.trim();
            form.style.display = 'none';

            if (feedbackBox) {
                feedbackBox.style.display = 'flex';
                if (feedbackTitle) feedbackTitle.textContent = `Thank You, ${userName}!`;
                if (feedbackMsg) {
                    feedbackMsg.innerHTML = `Your message has been verified and validated successfully.<br>` +
                        `<strong>Note for site owner:</strong> This frontend project demonstrates working client validation. ` +
                        `To receive emails in production, connect this form to an endpoint like Formspree, EmailJS, or your server API.`;
                }
            }
        }
    });

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            form.reset();
            form.style.display = 'block';
            if (feedbackBox) feedbackBox.style.display = 'none';
            if (nameInput) nameInput.focus();
        });
    }
}

/* ==========================================================================
   9. POLICY MODAL (PRIVACY & REFUND)
   ========================================================================== */
function initPolicyModal() {
    const modal = document.getElementById('policy-modal');
    const closeBtn = document.getElementById('policy-modal-close');
    const dismissBtn = document.getElementById('policy-modal-dismiss');
    const titleEl = document.getElementById('policy-modal-title');
    const contentEl = document.getElementById('policy-modal-content');
    const privacyTrigger = document.getElementById('privacy-policy-trigger');
    const refundTrigger = document.getElementById('refund-policy-trigger');

    if (!modal || !contentEl) return;

    function openPolicy(type) {
        if (type === 'privacy') {
            if (titleEl) titleEl.textContent = 'Privacy Policy';
            contentEl.innerHTML = `
                <h4>1. Information We Collect</h4>
                <p>We respect your personal privacy. In this demo website, information submitted through our contact or order request modals is processed purely client-side and is not permanently stored or shared with third parties.</p>
                <h4>2. Communication & Orders</h4>
                <p>When you choose to order via WhatsApp, communication is handled directly through your WhatsApp account under Meta's privacy policies.</p>
                <h4>3. Configurable Terms</h4>
                <p>This policy statement is a template placeholder for ${STORE_CONFIG.storeName}. Replace with your official legal terms when deploying to production.</p>
            `;
        } else {
            if (titleEl) titleEl.textContent = 'Refund & Freshness Policy';
            contentEl.innerHTML = `
                <h4>1. Our Freshness Guarantee</h4>
                <p>We stand behind the quality and freshness of every juice we squeeze. If your drink does not meet our high standards upon pickup or delivery, please notify our team immediately.</p>
                <h4>2. Same-Day Replacements</h4>
                <p>Because our beverages are perishable and freshly made to order without artificial preservatives, replacement requests are gladly accommodated at our counter on the same day of purchase.</p>
                <h4>3. Store Inquiries</h4>
                <p>For questions regarding an in-store order, please contact us at ${STORE_CONFIG.storePhone} or speak with a manager at our counter.</p>
            `;
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closePolicy() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (privacyTrigger) privacyTrigger.addEventListener('click', () => openPolicy('privacy'));
    if (refundTrigger) refundTrigger.addEventListener('click', () => openPolicy('refund'));
    if (closeBtn) closeBtn.addEventListener('click', closePolicy);
    if (dismissBtn) dismissBtn.addEventListener('click', closePolicy);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePolicy();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closePolicy();
        }
    });
}

/* ==========================================================================
   10. DYNAMIC COPYRIGHT YEAR & UTILITIES
   ========================================================================== */
function initCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

/**
 * Basic HTML escaping helper to prevent XSS in dynamic text
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return m;
        }
    });
}