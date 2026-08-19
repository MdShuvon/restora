# 🍽️ Restora - Modern Restaurant Dashboard

A full-featured restaurant management system with a public storefront, customer ordering, and admin dashboard. Built with vanilla JavaScript, Node.js, and designed for easy deployment.

![Restora Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node Version](https://img.shields.io/badge/Node-14+-green)

---

## ✨ Features

### 🏪 **Public Storefront**

- Best-selling items showcase
- Customer reviews and ratings
- Item pricing and popularity metrics
- Owner access portal (password protected)

### 🛒 **Customer Ordering System**

- Easy-to-use order form
- Table number assignment
- Menu item selection with real-time pricing
- Special notes/requests
- **Instant PDF Receipt Generation**
- Order status tracking

### 👨‍💼 **Restaurant Admin Dashboard**

- Menu management (add/delete items with pricing)
- Live order queue with status tracking
- Order status management (Pending → Ready)
- Table notification system
- Real-time metrics (pending orders, revenue)

### 🎨 **Modern UI/UX**

- Responsive design
- Beautiful Fraunces + Plus Jakarta Sans typography
- Smooth animations and transitions
- Success/error notifications
- Professional color scheme

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/restora.git
cd restora

# Install dependencies
npm install

# Start the local server
npm start

# Open in browser
# http://localhost:3000
```

### Development

```bash
# Run syntax checks
npm run check

# Start server
npm start
```

---

## 📂 Project Structure

```
restora/
├── index.html              # 🏠 Public home page (best sellers)
├── customer.html           # 🛒 Customer order form
├── restaurant.html         # 👨‍💼 Admin dashboard
├── index.js                # Home page logic
├── customer.js              # Order form & PDF generation
├── restaurant.js            # Admin panel logic
├── styles.css               # Global styling
├── server.js                # Local dev server
├── api/
│   ├── _db.js                # Shared Neon/Postgres connection
│   ├── menu.js                # 📋 Menu API
│   ├── orders.js              # 📦 Orders API
│   └── reviews.js             # ⭐ Reviews API
├── scripts/                   # Utility / setup scripts
├── .env.example                # Environment variable template
└── vercel.json                  # Vercel configuration
```
 
---

## 🔑 Admin Access

**Password:** `restora123`

Click "Owner access" button on the home page to reach the admin dashboard.

---

## 📡 API Endpoints

### Menu API (`/api/menu`)

- `GET /api/menu` - Fetch all menu items
- `POST /api/menu` - Add new item
- `DELETE /api/menu?id=1` - Remove item

### Orders API (`/api/orders`)

- `GET /api/orders` - Fetch all orders
- `POST /api/orders` - Create order
- `PATCH /api/orders?id=1` - Update order status
- `DELETE /api/orders?id=1` - Delete order

---

## 🎯 User Flows

**Customer:**

1. Visit home page → Click "Order now"
2. Select table, menu item, quantity, notes
3. Submit → PDF receipt auto-generates
4. Print or save receipt

**Restaurant Owner:**

1. Click "Owner access" → Enter password
2. **Menu:** Add/remove items
3. **Orders:** Track live orders, mark ready, call tables

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Data Storage:** In-memory (no database required)
- **UI Framework:** Custom responsive design

---

## 🚢 Deployment

### Local Development

```bash
npm start
# http://localhost:3000
```

### Production (Recommended: Railway.app or Render.com)

**Railway.app:**

1. Sign up at railway.app
2. Connect GitHub repository
3. Auto-detects Node.js
4. One-click deploy

**Render.com:**

1. Sign up at render.com
2. New Web Service → GitHub
3. Auto-deploys on push

---

## 🎨 Customization

### Change Admin Password

Edit `restaurant.js`:

```javascript
const ADMIN_PASSWORD = "restora123"; // Change this
```

### Customize Colors

Edit `styles.css`:

```css
:root {
  --accent: #b85c38; /* Primary */
  --accent-2: #1d7f73; /* Secondary */
  --bg: #f4efe7; /* Background */
}
```

### Change Restaurant Name

Update `<h1>Restora</h1>` in all HTML files

---

## 📝 License

MIT License - Free to use and modify

---

## 🎉 Ready to Get Started?

1. Clone this repo
2. `npm install && npm start`
3. Visit http://localhost:3000
4. Deploy to Railway.app or Render.com
5. Share with customers!

**Happy ordering! 🍽️**

## Database setup

Use Vercel Postgres or any Postgres provider with a connection string.

1. Create a Vercel project and add Vercel Postgres.
2. Set `POSTGRES_URL` in the project environment variables.
3. Deploy the app.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Put your Postgres connection string in `POSTGRES_URL`.
3. Run `npm install`.
4. Run `npm run dev` if you have the Vercel CLI available.

## Notes

- The database table is created automatically the first time the API runs.
- This app is separate from the Java Swing files in the parent folder because Vercel cannot host Swing apps directly.
