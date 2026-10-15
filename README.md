# Fresh Juice Shop 🍊🥤
> Premium, cold-pressed fruit juices made fresh daily. Real fruits, natural flavours, and pure refreshment in every sip.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Design-Responsive-success)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

## 🌟 Overview

**Fresh Juice Shop** is an artisan web storefront for a boutique fresh juice bar. It provides an engaging customer experience with live currency exchange calculation (USD to INR), interactive order customization with WhatsApp integration, a responsive menu search and filter engine, a photo gallery with lightbox, and a client-side contact validation system.

---

## ✨ Features

- 🌿 **Hero Showcase**: High-impact hero section with animated organic backdrop blobs, trust pills, and promotional badges.
- 🍹 **Interactive Juice Menu**:
  - Filter by category: **All**, **Citrus**, **Berry**, **Tropical**, **Green Detox**.
  - Real-time search by juice name or ingredients.
  - Sort by price (low-to-high, high-to-low) and popularity.
- 💱 **Live Currency Conversion**:
  - Dynamically fetches exchange rates via live currency APIs (`open.er-api.com` / `api.frankfurter.dev`).
  - Seamlessly formats prices into Indian Rupees (`₹`) with local number formatting while preserving fallback calculations.
- 🛒 **Interactive Order Modal**:
  - Custom size selector (**Regular 350ml**, **Large 500ml**, **Bottle Pack 1000ml**) with real-time price tallying.
  - Sweetness preference (**100% Pure Natural**, **Light Agave Nectar**, **Natural Raw Honey**).
  - Ice level options (**Regular Chilled**, **Light Ice**, **No Ice**).
  - Direct order dispatch via **WhatsApp** with auto-formatted itemized message.
  - Counter pickup request simulation with instant feedback.
- 🖼️ **Gallery Lightbox**: Fullscreen responsive photo preview with keyboard navigation (Esc, Left, Right arrow keys).
- ✉️ **Contact Form Validation**: Real-time form validation with custom feedback alerts for instant customer inquiries.
- 📱 **Fully Responsive & Accessible**: Mobile slide-out drawer menu, accessibility skip-to-content links, ARIA labels, and `prefers-reduced-motion` support.

---

## 📂 Directory Structure

```text
Fruit-Juice-Shop/
├── Assets/                        # Image assets and media
│   ├── 1.jpg ... 6.jpg            # Gallery showcase images
│   ├── apple.jpg, berry.jpg ...   # Product card imagery
│   ├── image1-removebg-preview.png# Hero bottle illustration
│   ├── image2.jpg                 # About Us story feature image
│   └── logo2.jpg                  # Brand identity favicon and logo
├── index.html                     # Semantic HTML5 application entry
├── style.css                      # Modular CSS design system & responsive queries
├── script.js                      # Vanilla JavaScript (ES6+) client interaction logic
├── CHANGELOG.md                   # Six-day development changelog (July 26–31, 2025)
└── README.md                      # Project documentation and quickstart guide
```

---

## 🚀 Quickstart & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vignesh-swe-dev/Fruit-Juice-Shop.git
   cd Fruit-Juice-Shop
   ```

2. **Run locally**:
   - Simply double click `index.html` to open it in your default web browser, or
   - Use a lightweight local server (e.g., Live Server in VS Code, or `npx serve .`):
     ```bash
     npx serve .
     ```

3. **Configure Store Parameters**:
   Open `script.js` and edit the `STORE_CONFIG` object to update your business details:
   ```javascript
   const STORE_CONFIG = {
       whatsappNumber: "15552345678", // Replace with your shop's WhatsApp number
       storeName: "Fresh Juice Shop",
       storeEmail: "hello@freshjuiceshop.com",
       storePhone: "+1 (555) 234-5678",
       storeAddress: "123 Fresh Orchard Lane, Green Valley, CA 94016",
       currency: {
           code: "INR",
           symbol: "₹",
           fallbackExchangeRate: 95.0
       }
   };
   ```

---

## 📅 Development Schedule & Commit History

| Stage & Date | Commit Message | Description |
|---|---|---|
| **July 26, 2025 (Stage 1.1)** | `chore: initialize repository structure and base HTML boilerplate` | HTML5 skeleton, meta tags, Google Fonts, and Font Awesome links. |
| **July 26, 2025 (Stage 1.2)** | `feat: construct site navigation and hero landing section` | Header navigation, mobile menu markup, brand logo, and hero section. |
| **July 27, 2025 (Stage 2.1)** | `style: establish CSS design tokens, reset rules, and base layout utilities` | CSS variables (`:root`), typography, resets, announcement and nav styles. |
| **July 27, 2025 (Stage 2.2)** | `style: add responsive typography, hero animations, and section layout styling` | Hero section styles, gradient background blobs, and floating badge animations. |
| **July 28, 2025 (Stage 3.1)** | `feat: implement navigation drawer, scroll behavior, and currency exchange engine` | Store config, dynamic currency exchange engine, and mobile drawer toggle. |
| **July 28, 2025 (Stage 3.2)** | `feat: add menu search filter, order modal calculator, and gallery lightbox logic` | Real-time search/filter, interactive order modal calculation, and lightbox. |
| **July 29, 2025 (Stage 4.1)** | `feat: add complete juice product menu, about story, and customer contact sections` | Complete About, Menu catalog (8 products), Gallery, Contact, and Modals. |
| **July 29, 2025 (Stage 4.2)** | `assets: integrate brand imagery, product photos, and gallery assets` | Complete set of 15 image assets for branding, products, and gallery. |
| **July 30, 2025 (Stage 5.1)** | `style: complete comprehensive component styling, menu cards, and interactive modals` | Detailed styles for product cards, gallery grid, modals, and footer. |
| **July 30, 2025 (Stage 5.2)** | `fix: enhance responsive layouts, accessibility skip links, and touch interactions` | Media queries (1200px down to 375px) and `prefers-reduced-motion` rules. |
| **July 31, 2025 (Stage 6.1)** | `test: verify form validation, currency fallback rates, and cross-browser consistency` | End-to-end testing, error recovery validation, and syntax verification. |
| **July 31, 2025 (Stage 6.2)** | `docs: add comprehensive project README with setup instructions and development changelog` | Project documentation, setup guide, architecture details, and changelog. |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
