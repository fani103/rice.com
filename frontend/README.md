# 🌾 Faneesh Rice Shop — Full Stack MERN Application

A premium, production-ready e-commerce web app for a local rice business.

---

## 📁 Folder Structure

```
faneesh-rice-shop/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Product.js         # Product schema
│   │   └── Order.js           # Order schema
│   ├── routes/
│   │   ├── products.js        # Product API routes
│   │   └── orders.js          # Order API routes
│   ├── server.js              # Express entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── css/
│   │   └── style.css          # Premium CSS styles
│   ├── js/
│   │   ├── cart.js            # Cart utility (shared)
│   │   ├── cart-page.js       # Cart page logic
│   │   ├── main.js            # Home page logic
│   │   └── checkout.js        # Checkout + WhatsApp
│   ├── pages/
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── order-success.html
│   │   └── admin.html
│   └── index.html             # Home page
│
├── vercel.json                # Vercel deployment
├── render.yaml                # Render deployment
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Step 1 — Clone & Install

```bash
git clone <your-repo-url>
cd faneesh-rice-shop

# Install backend dependencies
cd backend
npm install
```

### Step 2 — Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your MongoDB URI:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/faneesh_rice_shop
# PORT=5000
```

> **Get a free MongoDB database:** https://www.mongodb.com/cloud/atlas (free tier)

### Step 3 — Start the Backend

```bash
cd backend
npm run dev       # Development (with auto-reload)
# or
npm start         # Production
```

Server will run at: **http://localhost:5000**

### Step 4 — Seed the Database

Open your browser and visit:
```
http://localhost:5000/api/products/seed
```
This adds 6 sample rice products to your database.

### Step 5 — Open the Frontend

Open `frontend/index.html` in your browser.

> **Recommended:** Use VS Code + Live Server extension for best experience.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with search/filter) |
| GET | `/api/products?search=basmati` | Search products |
| GET | `/api/products?type=Organic` | Filter by type |
| GET | `/api/products?sort=price_asc` | Sort products |
| GET | `/api/products/seed` | Seed sample data |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders` | Get all orders (admin) |
| GET | `/api/orders?status=PLACED` | Filter orders |
| GET | `/api/orders/:id` | Get single order |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/health` | Health check |

---

## 💳 Razorpay Setup

1. Sign up at https://razorpay.com
2. Get your Test API Key from Dashboard → Settings → API Keys
3. In `frontend/js/checkout.js`, replace:
   ```js
   key: 'rzp_test_YOUR_KEY_HERE'
   ```
   with your actual Razorpay key.

4. For production orders, create orders from the backend:
   ```js
   // backend/routes/orders.js - add Razorpay order creation
   const Razorpay = require('razorpay');
   const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
   ```

---

## 📱 WhatsApp Order

The WhatsApp order button automatically generates a pre-filled message with:
- Customer name, phone, address
- Full item list with quantities and prices
- Order total breakdown

To change the shop's WhatsApp number, edit these files:
- `frontend/js/checkout.js` → `const SHOP_PHONE = '919999999999'`
- `frontend/index.html` → all `href="https://wa.me/919999999999"` links

---

## 🌐 Deployment

### Option A — Deploy to Render (Recommended for Backend)

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Set:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node server.js`
5. Add environment variable: `MONGODB_URI`

### Option B — Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then set the `MONGODB_URI` environment variable in Vercel dashboard.

### Frontend Hosting (Free Options)

- **Netlify:** Drag & drop the `frontend/` folder at netlify.com
- **Vercel:** `vercel` CLI from the `frontend/` directory
- **GitHub Pages:** Push `frontend/` to a GitHub Pages branch

> ⚠️ After deploying the backend, update the `API_BASE` constant in:
> - `frontend/js/main.js`
> - `frontend/js/checkout.js`
> - `frontend/pages/admin.html`
>
> Change from `http://localhost:5000/api` to your deployed URL, e.g.:
> `https://faneesh-rice-shop.onrender.com/api`

---

## ✨ Features

- 🛍️ **Product Catalog** — Dynamic products with search, filter, sort
- 🛒 **Smart Cart** — localStorage cart with quantity controls
- 💳 **Checkout** — Customer form with COD, Razorpay, WhatsApp options
- 📱 **WhatsApp Orders** — Auto-generated order message
- 🎉 **Order Success** — QR code + downloadable PDF invoice
- 📊 **Admin Dashboard** — View orders, update status, manage products
- 💀 **Skeleton Loaders** — Premium loading UI
- 🔔 **Toast Notifications** — Real-time feedback
- 📱 **Mobile Responsive** — Works on all devices
- 🌿 **Premium Design** — Glassmorphism, gradients, smooth animations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Deployment | Render / Vercel |
| Payment | Razorpay (integration ready) |
| Fonts | Playfair Display + DM Sans |

---

## 📞 Support

For issues or customization, WhatsApp: +91 99999 99999

---

*Made with ❤️ for Faneesh Rice Shop, Coimbatore*