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