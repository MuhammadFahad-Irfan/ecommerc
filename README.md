# ModestWear — Production-Ready eCommerce Store

A full-stack eCommerce web application for selling Children, Women, and Islamic modest wear (burkha/veiling). Built with Next.js 14, MongoDB, and integrated with Easypaisa payment gateway.

## 🚀 Features

### Customer-facing
- **Modern responsive UI** with mobile-first design
- **Home page** with featured products, latest arrivals, and category showcase
- **Product browsing** with search, filters (price, rating, category), and pagination
- **Product details** with image gallery, dynamic star ratings, and reviews
- **Guest reviews & ratings** — no login required, with IP/name-based spam protection
- **Shopping cart** with localStorage persistence (synced to backend on order)
- **Guest checkout** — order without creating an account
- **Easypaisa payment integration** with mock mode for testing
- **Cash on Delivery** option
- **Order tracking page** accessible via order ID

### Admin Panel
- Login-protected admin dashboard
- Product CRUD (create, read, update, delete)
- Image upload (Cloudinary or URL paste)
- Order management with status updates
- Pagination & filtering

### Technical
- Clean modular architecture (ready for mobile app expansion)
- TypeScript everywhere
- API error handling middleware
- Zod validation on all inputs
- Loading states & UX feedback (toast notifications)
- SEO metadata & Open Graph tags
- CORS enabled for future mobile app

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT (admin only) |
| Payment | Easypaisa (with mock mode) |
| Images | Cloudinary (optional) |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## 📁 Project Structure

```
ecommerce/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API routes (backend)
│   │   │   ├── products/           # Product CRUD + reviews
│   │   │   ├── orders/             # Order management
│   │   │   ├── payment/            # Easypaisa integration
│   │   │   └── admin/              # Auth, image upload
│   │   ├── products/               # Product pages
│   │   ├── cart/                   # Cart page
│   │   ├── checkout/               # Checkout flow
│   │   ├── order/[id]/             # Order confirmation
│   │   ├── payment/                # Success/failed/mock pages
│   │   └── admin/                  # Admin panel
│   ├── components/                 # Reusable React components
│   ├── context/                    # React contexts (CartContext)
│   ├── lib/                        # Helpers, DB, utilities
│   │   ├── db.ts                   # MongoDB connection
│   │   ├── api.ts                  # Axios client
│   │   ├── auth.ts                 # JWT auth
│   │   ├── easypaisa.ts            # Payment integration
│   │   ├── cloudinary.ts           # Image upload
│   │   ├── validators.ts           # Zod schemas
│   │   ├── apiHelpers.ts           # Error handling
│   │   ├── utils.ts                # Helpers
│   │   └── seed.ts                 # DB seeder
│   ├── models/                     # Mongoose schemas
│   │   ├── Product.ts
│   │   └── Order.ts
│   └── types/                      # TypeScript types
├── public/                         # Static assets
├── .env.example                    # Env template
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- (Optional) Cloudinary account for image uploads
- (Optional) Easypaisa merchant account for live payments

### Step 1 — Install Dependencies
```bash
cd ecommerce
npm install
```

### Step 2 — Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then fill in your values:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_long_random_secret_here
ADMIN_EMAIL=admin@store.com
ADMIN_PASSWORD=admin123

# Set this to "true" to test payment flow without real Easypaisa account
MOCK_PAYMENT=true

# Required only when MOCK_PAYMENT=false
EASYPAISA_MERCHANT_ID=your_merchant_id
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_HASH_KEY=your_hash_key

# Optional — for image uploads (otherwise paste image URLs manually)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 3 — Start MongoDB
**Local:** Make sure MongoDB is running:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Atlas:** Just paste your connection string into `MONGODB_URI`.

### Step 4 — Seed Sample Data (Optional)
Populate the database with sample products to play with:
```bash
npm run seed
```

### Step 5 — Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Step 6 — Access the Admin Panel
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with the email/password from your `.env.local`.

## 🔌 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters: search, category, minPrice, maxPrice, minRating, sort, page, limit, featured) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/:id/reviews` | List product reviews |
| POST | `/api/products/:id/reviews` | Add a review (guest, no login) |
| POST | `/api/orders` | Place an order (guest checkout) |
| GET | `/api/orders/:id` | Get order details (for tracking) |
| POST | `/api/payment/initiate` | Get payment redirect URL |
| GET/POST | `/api/payment/easypaisa/callback` | Payment gateway webhook |

### Admin Endpoints (require auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| POST | `/api/admin/upload` | Upload image to Cloudinary |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/orders` | List all orders |
| PATCH | `/api/orders/:id` | Update order status |

## 💳 Payment Flow

### Mock Mode (recommended for development)
1. Set `MOCK_PAYMENT=true` in `.env.local`
2. Place an order on the storefront
3. You'll be redirected to a mock gateway page
4. Click "Simulate Successful Payment" or "Simulate Failed Payment"
5. The callback updates the order status and redirects to success/failed page

### Live Mode (production)
1. Set `MOCK_PAYMENT=false`
2. Configure `EASYPAISA_MERCHANT_ID`, `EASYPAISA_STORE_ID`, `EASYPAISA_HASH_KEY`
3. Set `EASYPAISA_RETURN_URL` to your production callback URL
4. Customers will be redirected to the actual Easypaisa portal

> **Note:** Easypaisa's exact API parameters and hash format may change. Verify against the latest [Easypaisa Merchant Documentation](https://easypaisa.com.pk) and adjust `src/lib/easypaisa.ts` accordingly. The mock mode is fully self-contained and doesn't require any Easypaisa account.

## 🛡 Spam Protection

Reviews are protected from spam with multiple checks:
1. **IP-based:** Same IP cannot review the same product within 24 hours
2. **Name-based:** Same name cannot review the same product within 1 hour
3. **Validation:** Min length, character limits, valid rating range (1-5)

For production, consider adding:
- Cloudflare Turnstile / reCAPTCHA
- Rate limiting middleware (e.g., upstash-ratelimit)
- Profanity filtering

## 📱 Future Mobile App

The codebase is structured to make mobile app development easy:

- **Shared types** in `src/types/` can be reused in the mobile app
- **CORS is already enabled** in `next.config.js`
- **JWT tokens** are returned in the login response (in addition to cookies) for mobile use
- **All endpoints are RESTful** and return consistent JSON structure
- **Authentication** can use the `Authorization: Bearer <token>` header

To consume the API from a mobile app, just call `https://yoursite.com/api/...` with the same payloads documented above.

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all `.env.local` variables in the Vercel dashboard
4. Deploy ✨

### Other Platforms
The app works on any Node.js host (Railway, Render, DigitalOcean App Platform). Build with:
```bash
npm run build
npm run start
```

### Environment Variables for Production
- Set `MOCK_PAYMENT=false`
- Use a strong `JWT_SECRET` (32+ random characters)
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Set `EASYPAISA_RETURN_URL` to `https://yoursite.com/api/payment/easypaisa/callback`

## 🧪 Available Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with sample products
```

## 📝 License

MIT — feel free to use this for your own projects.

## 💬 Support

Issues? Open an issue on GitHub or reach out to support@modestwear.pk
