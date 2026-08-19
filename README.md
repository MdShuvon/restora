# 🍽️ Restora — Modern Restaurant Dashboard

A full-featured restaurant management system with a public storefront, customer ordering, and an admin dashboard — built with vanilla JavaScript and a serverless Postgres backend, ready to deploy on Vercel in minutes.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node Version](https://img.shields.io/badge/Node-14+-green)
![Database](https://img.shields.io/badge/Database-Postgres%20(Neon)-336791)

**🔗 Live demo:** [restora-topaz-xi.vercel.app](https://restora-topaz-xi.vercel.app)

---

## ✨ Features

### 🏪 Public Storefront
- Best-selling items showcase
- Customer reviews and ratings
- Live pricing and popularity metrics
- Owner access portal (password protected)

### 🛒 Customer Ordering System
- Simple, mobile-friendly order form
- Table number assignment
- Menu item selection with real-time pricing
- Special notes/requests per order
- Instant PDF receipt generation
- Live order status tracking

### 👨‍💼 Restaurant Admin Dashboard
- Menu management — add / delete items with pricing
- Live order queue with status updates (Pending → Ready)
- Payment tracking (paid / unpaid, method, staff)
- Table notification system
- Real-time metrics (pending orders, revenue)

### 🎨 Modern UI/UX
- Fully responsive design
- Fraunces + Plus Jakarta Sans typography
- Smooth animations and transitions
- Success/error toast notifications
- Clean, professional color palette

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js serverless functions (Vercel) |
| Database | PostgreSQL via [Neon](https://neon.tech) (`@neondatabase/serverless`) |
| Hosting | [Vercel](https://vercel.com) |

Data persists in a real Postgres database — orders, menu items, and reviews all survive redeploys.

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

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm
- A [Neon](https://neon.tech) Postgres project (free tier works fine)

### Installation

```bash
# Clone the repository
git clone https://github.com/MdShuvon/restora.git
cd restora

# Install dependencies
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your Neon connection string:

```
DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require
```

### Run locally

```bash
npm start
# Open http://localhost:3000
```

---

## 🌐 Deploying to Vercel

1. Push this repo to your own GitHub account
2. Import the repo into [Vercel](https://vercel.com/new)
3. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Neon Postgres connection string
4. Deploy — Vercel auto-detects the serverless functions in `api/`
5. Visit your live URL and confirm menu items / orders persist after a redeploy

---

## 📡 API Endpoints

### Menu — `/api/menu`
| Method | Description |
|---|---|
| `GET` | Fetch all menu items |
| `POST` | Add a new item `{ name, price }` |
| `DELETE ?id=` | Remove an item |

### Orders — `/api/orders`
| Method | Description |
|---|---|
| `GET` | Fetch all orders |
| `POST` | Create a new order |
| `PATCH ?id=` | Update order status / payment |
| `DELETE ?id=` | Delete an order |

### Reviews — `/api/reviews`
| Method | Description |
|---|---|
| `GET` | Fetch all reviews |
| `POST` | Submit a new review `{ itemName, rating, comment, customerName }` |

---

## 🎯 User Flows

**Customer**
1. Visit the home page → tap "Order now"
2. Select table, menu item(s), quantity, notes
3. Submit → PDF receipt auto-generates
4. Print or save the receipt

**Restaurant Owner**
1. Tap "Owner access" → enter password
2. **Menu tab** — add or remove items
3. **Orders tab** — track live orders, mark ready, notify tables, record payments

---

## 🔑 Admin Access

Default password: `restora123`

> ⚠️ Change this before going live — see Customization below.

---

## 🎨 Customization

**Change the admin password** — edit `restaurant.js`:
```js
const ADMIN_PASSWORD = "restora123"; // change this
```

**Change the color palette** — edit `styles.css`:
```css
:root {
  --accent: #b85c38;   /* primary */
  --accent-2: #1d7f73; /* secondary */
  --bg: #f4efe7;       /* background */
}
```

**Change the restaurant name** — update `<h1>Restora</h1>` in each HTML file.

---

## 🗄️ Database Notes

- Tables are created automatically the first time the API runs.
- Data is stored in Postgres (Neon), so nothing is lost on redeploy — unlike the earlier in-memory version.
- This web app is separate from any Java Swing files in a parent folder, since Vercel cannot host Swing apps.

---

## 📝 License

MIT License — free to use, modify, and deploy.

---

## 🎉 Get Started

1. Clone this repo
2. `npm install`
3. Set up your `DATABASE_URL`
4. `npm start` → visit `http://localhost:3000`
5. Deploy to Vercel and share with customers!

**Happy ordering! 🍽️**