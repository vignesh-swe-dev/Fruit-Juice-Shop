# Changelog — Fruit Juice Shop

All notable changes to the Fruit Juice Shop project are documented below, organized by the six development stages.

## [July 26, 2025] — Project Setup
### Added
- Repository initialization with HTML5 boilerplate in `index.html`.
- Viewport configurations, Open Graph meta tags, and favicon link.
- Integration with Google Fonts (Outfit & Poppins) and Font Awesome 6.5.1 CDN.
- Top promotional announcement bar with business hours and telephone link.
- Desktop and mobile navigation header with logo branding and responsive toggle button.
- Hero landing section with value proposition, call-to-action buttons, and trust badges.

## [July 27, 2025] — Styling & Visual Design System
### Added
- CSS custom properties (`:root` design tokens) defining the brand color palette, font families, shadows, and transitions.
- Modern CSS reset rules and box-sizing normalization.
- Reusable utility classes (`.section-content`, button variants `.btn-primary`, `.btn-secondary`).
- Typography hierarchy and link hover states.
- Announcement bar and navigation bar styling with sticky header readiness.
- Hero section layout with organic animated gradient blobs (`.hero-blob-1`, `.hero-blob-2`).
- Floating trust badges with subtle floating animations and drop shadows.

## [July 28, 2025] — JavaScript Interactions
### Added
- Centralized store configuration (`STORE_CONFIG`) for contact details, currency, and WhatsApp dispatch.
- Currency conversion engine supporting live exchange rate fetching from public APIs (`open.er-api.com`, `api.frankfurter.dev`) with automatic fallback to configured rates.
- Indian Rupee (`₹`) formatting using `Intl.NumberFormat` locale standards.
- Mobile drawer navigation controller with backdrop overlay click listeners and Escape key handling.
- Scroll observer applying elevation shadows to the header on page scroll.
- Interactive category filter tabs for instant filtering across Citrus, Berry, Tropical, and Green Detox juices.
- Live keyword search filtering juice cards in real time.
- Interactive order modal with dynamic size selection, sweetness preference, ice levels, and automated price recalculation.
- WhatsApp order message builder that prepares itemized orders for one-click transmission.
- Fullscreen gallery lightbox with Next/Previous buttons and keyboard navigation.
- Client-side contact form validation with error messaging and success feedback display.

## [July 29, 2025] — Content, Catalog & Media Assets
### Added
- About Us section featuring the brand's artisanal philosophy and four quality pillar cards.
- Complete Juice Menu catalog featuring 8 signature fruit juices:
  - Strawberry Juice
  - Fresh Watermelon Juice
  - Purple Grape Juice
  - Pure Apple Juice
  - Tropical Mango Juice
  - Green Detox Juice
  - Citrus Sunrise
  - Berry Blast
- Data attributes on juice cards (`data-category`, `data-price`, `data-name`) enabling search and filter features.
- Photo gallery section with a 6-item photo grid showcasing shop creations.
- Store contact section with address, operational hours, email, phone, and inquiry form.
- Footer section with quick links, popular juices, legal policy triggers, and copyright notice.
- Interactive modal shells: Order Customizer, Gallery Lightbox, and Policy Dialog.
- Integrated 15 image assets into the `Assets/` folder:
  - Brand favicon and logo (`logo2.jpg`)
  - Hero transparent product render (`image1-removebg-preview.png`)
  - About story illustration (`image2.jpg`)
  - 6 juice product photos (`apple.jpg`, `berry.jpg`, `fruit.jpg`, `multi.jpg`, `tree.jpg`, `water.jpg`)
  - 6 gallery showcase images (`1.jpg` through `6.jpg`)

## [July 30, 2025] — Improvements, Refinements & Accessibility
### Added
- Comprehensive component styling for About section feature grid and metric cards.
- Juice menu card styling with hover elevation, category badges, and price tag styling.
- Gallery masonry grid styles with zoom effect and hover icon overlay.
- Contact form panel styles, floating input wrappers, and validation error messages.
- Custom order modal styling, size selection radio cards, and quantity controls.
- Responsive media queries across 5 screen breakpoints (1200px, 992px, 768px, 576px, and 375px).
- Accessibility skip-link (`.skip-link`) for screen reader and keyboard accessibility.
- `prefers-reduced-motion` media query disabling decorative blob animations for users with vestibular sensitivities.

## [July 31, 2025] — Finalization, Testing & Documentation
### Added
- End-to-end JavaScript syntax validation with Node.js parser.
- Cross-browser styling verification and markup integrity audit.
- Fallback resilience check for currency API rate failure scenarios.
- Comprehensive `README.md` documentation detailing project features, setup, and configuration.
- Six-day development changelog in `CHANGELOG.md`.
