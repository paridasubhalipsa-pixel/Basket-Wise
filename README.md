# BasketWise – Smart Shopping Comparison System

BasketWise is a full-stack MERN shopping intelligence web platform that helps consumers make smarter shopping decisions by comparing prices of similar products from multiple verified retail sellers in one unified interface.

---

## 1. Key Features

- **Multi-Seller Price Comparison**: Identifies the true lowest market offer among authorized retailers (Croma, Reliance Digital, Vijay Sales, Tata CLiQ, TechDirect).
- **Product Discovery & Granular Filtering**: Debounced search by keywords, category, brand, price ranges, customer ratings, and verified discounts.
- **Side-by-Side Product Comparison Workspace**: Compare up to 4 items simultaneously with highlighted best offers, seller breakdowns, and technical specifications diff.
- **Shopping Basket Calculator**: Assemble multiple products, select individual seller offers per item, see line-item totals, and simulate total basket savings vs single-seller checkouts.
- **Persistent User Wishlists**: Save favorite items with automatic lowest-offer tracking across sessions.
- **Custom Shopping Lists**: Create multiple named lists, check off purchased items in real-time, view list progress percentages, and monitor estimated catalog totals.
- **Target Price Alerts**: Set target price thresholds; the system evaluates current offers and flags whenever market offers drop to meet or beat the target.
- **Verified Price History Charts**: Interactive visual timelines powered by Recharts displaying genuine timestamped observations.
- **Role-Based Authentication**: JWT session handling with secure HTTP-only cookies, password hashing via `bcryptjs`, and protected routes.
- **Comprehensive Admin Dashboard**: Database metrics, catalog CRUD operations (products, categories, sellers, offers), role assignment, and 1-click demo dataset reset.

---

## 2. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts, Context API.
- **Backend**: Node.js, Express.js, REST API architecture under `/api/v1`, JWT authentication, `cookie-parser`, `bcryptjs`.
- **Database Architecture**: Mongoose ODM with dual-mode storage:
  - If a `MONGODB_URI` is provided, connects directly to MongoDB / Atlas.
  - If MongoDB is absent or offline, seamlessly persists in a local file-based database (`.data/basketwise_db.json`), ensuring zero crashes in containerized or local test environments.

---

## 3. Demo Credentials

The system comes pre-seeded with realistic demonstration data:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@basketwise.com` | `Admin@123` |
| **Standard User** | `alex@example.com` | `User@123` |

*Note: The Login page also features 1-click quick-fill buttons for instant demo access.*

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (Optional: required only if you wish to run a dedicated MongoDB daemon)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables:
```ini
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
COOKIE_SECURE=false
MONGODB_URI=mongodb://127.0.0.1:27017/basketwise
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 5. API Reference (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Health & service status check | Public |
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Log in and receive session cookie | Public |
| `POST` | `/api/v1/auth/logout` | Clear auth session | Public |
| `GET` | `/api/v1/auth/me` | Fetch active user session | Public |
| `PATCH` | `/api/v1/auth/change-password` | Update account password | User |
| `GET` | `/api/v1/products` | Search, filter, and paginate products | Public |
| `GET` | `/api/v1/products/:idOrSlug` | Detailed product, seller offers, and price history | Public |
| `POST` | `/api/v1/products` | Create catalog product | Admin |
| `PATCH` | `/api/v1/products/:id` | Update product | Admin |
| `DELETE` | `/api/v1/products/:id` | Delete product | Admin |
| `GET` | `/api/v1/categories` | Retrieve all active taxonomy categories | Public |
| `GET` | `/api/v1/sellers` | Retrieve authorized partner retailers | Public |
| `POST` | `/api/v1/offers` | Publish seller offer with price history tracking | Admin |
| `GET` | `/api/v1/wishlist` | Retrieve authenticated user's wishlist | User |
| `POST` | `/api/v1/wishlist/items` | Add product to wishlist | User |
| `DELETE` | `/api/v1/wishlist/items/:productId` | Remove product from wishlist | User |
| `GET` | `/api/v1/shopping-lists` | Retrieve all user shopping lists | User |
| `POST` | `/api/v1/shopping-lists` | Create named shopping list | User |
| `PATCH` | `/api/v1/shopping-lists/:id` | Update items and purchased statuses | User |
| `DELETE` | `/api/v1/shopping-lists/:id` | Delete shopping list | User |
| `GET` | `/api/v1/price-alerts` | Retrieve user's evaluated price drop alerts | User |
| `POST` | `/api/v1/price-alerts` | Configure new target price alert | User |
| `DELETE` | `/api/v1/price-alerts/:id` | Delete price alert | User |
| `GET` | `/api/v1/admin/dashboard` | Administrative overview metrics | Admin |
| `POST` | `/api/v1/admin/reset-demo` | Restore initial pristine demo catalog | Admin |
| `POST` | `/api/v1/contact` | Submit contact message | Public |

---

## 6. Ethical Compliance & Demo Mode Disclosure
BasketWise indexes authentic verified retail benchmarks and historical observations. It does not engage in unauthorized scraping or simulated transactions. All final purchases are transacted directly with third-party authorized retailers.
