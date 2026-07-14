# PropFinder — Real Estate Mobile Application

> Full-stack real estate mobile app built with **React Native (Expo)** + **Node.js/Express** + **MongoDB**

---

## 📱 App Overview

PropFinder is a feature-rich real estate mobile application that allows users to discover, save, and schedule visits to properties across major Indian cities. It includes an AI-powered property search assistant, builder contact system, and construction progress tracking.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile (Frontend)** | React Native (Expo Managed Workflow) |
| **Navigation** | Expo Router (file-based routing) |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Atlas / Local) |
| **Authentication** | JWT (JSON Web Tokens) |
| **AI Engine** | Custom Rule-based NLP (no external API) |

---

## ✨ Features Implemented

### Core Modules
- **Onboarding** — 3-screen animated walkthrough
- **Authentication** — Register, Login, JWT sessions, Logout
- **Home** — Featured carousel, city filters, property feed
- **Explore** — Advanced search with filters (BHK, price, type, city, status)
- **Saved Properties** — Save/unsave with persistent bookmarks
- **Property Detail** — Image carousel, amenities, builder contact, specs
- **Construction Progress** — 6-stage visual timeline tracker
- **Site Visit Booking** — Date picker, time slots, confirmation screen
- **Notifications** — Real-time alerts with mark-read and delete
- **Profile** — Edit profile, preferences, notification settings
- **My Visits** — Upcoming/past visits with reschedule and cancel

### AI Feature
- **Text Chat** — Natural language property search ("2 BHK under 80L in Pune")
- **Smart Questionnaire** — 5-step guided search (budget → type → city → amenities → timeline)
- **Quick Suggestions** — Pre-built search chips for common queries
- **No external AI API** — Pure rule-based NLP engine (no quota/billing)

---

## 📂 Project Structure

```
real-estate-app/
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   │   ├── authController.js
│   │   │   ├── propertyController.js
│   │   │   ├── visitController.js
│   │   │   ├── notificationController.js
│   │   │   └── aiController.js
│   │   ├── models/             # MongoDB Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Property.js
│   │   │   ├── SavedProperty.js
│   │   │   ├── SiteVisit.js
│   │   │   └── Notification.js
│   │   ├── routes/             # Express API routes
│   │   ├── middleware/         # JWT auth middleware
│   │   ├── seed/               # Database seed script
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
├── mobile/                     # React Native Expo app
│   ├── app/
│   │   ├── (auth)/             # Login, Register screens
│   │   ├── (tabs)/             # Home, Explore, Saved, Profile tabs
│   │   ├── property/           # Detail, Construction, Book Visit
│   │   ├── ai-assistant.tsx    # AI chat screen
│   │   ├── notifications.tsx
│   │   └── profile/            # Edit, Visits, Preferences
│   ├── components/             # Reusable UI components
│   ├── stores/                 # Zustand state stores
│   ├── services/               # Axios API service
│   ├── constants/              # Theme, API config
│   └── package.json
├── database/                   # MongoDB dump files
│   ├── properties.json         # 15 seed properties
│   └── users.json              # 2 test user accounts
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- npm v9+
- Android Studio (for Android emulator) or Expo Go app
- MongoDB Atlas account (free) or local MongoDB

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/sudha-sa/real-estate-app.git
cd real-estate-app
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/realestatedb
JWT_SECRET=real_estate_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas (Free):**
> 1. Visit [cloud.mongodb.com](https://cloud.mongodb.com) → Create free M0 cluster
> 2. Database Access → Add user (e.g. `realestate` / `realestate123`)
> 3. Network Access → Allow `0.0.0.0/0`
> 4. Connect → Drivers → Copy connection string

**Seed the database:**

```bash
npm run seed
```

**Start the backend:**

```bash
npm run dev
```

✅ Backend running at: `http://localhost:5001`
✅ Health check: `http://localhost:5001/api/health`

---

### Step 3 — Mobile App Setup

```bash
cd ../mobile
npm install --legacy-peer-deps
```

**Run on Android Emulator:**

```bash
npx expo start --clear --android
```

**Run on iOS Simulator (Mac only):**

```bash
npx expo start --clear --ios
```

**Run on Real Device (Expo Go App):**

```bash
npx expo start --clear
```

Then scan the QR code with the Expo Go app on your phone.

> ⚠️ **For real device:** Update `mobile/constants/api.ts` — change `localhost` to your machine's local IP (`ipconfig getifaddr en0` on Mac)

---

## 🗄️ Database Import

The `database/` folder contains JSON dump files for quick setup.

### Import using mongoimport:

```bash
# Import Properties (15 records)
mongoimport --uri="your-mongodb-uri" \
  --collection=properties \
  --file=database/properties.json \
  --jsonArray

# Import Users (2 records)
mongoimport --uri="your-mongodb-uri" \
  --collection=users \
  --file=database/users.json \
  --jsonArray
```

> **Alternatively**, run the seed script which auto-populates everything:
> ```bash
> cd backend && npm run seed
> ```

---

## 🔐 Test Credentials

```
Email:    test@realestate.com
Password: Test@123

Email:    priya@realestate.com
Password: Test@123
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5001/api
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update profile |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List properties with filters |
| GET | `/properties/featured` | Get featured properties |
| GET | `/properties/:id` | Get property detail |
| GET | `/properties/saved` | Get user saved list |
| POST | `/properties/:id/save` | Save a property |
| DELETE | `/properties/:id/save` | Remove from saved |

**Filter Query Params for GET /properties:**
```
?city=Mumbai&bhk=3&type=Apartment&status=Ready to Move
&minPrice=50&maxPrice=200&sort=price_asc&page=1&limit=10
```

### Site Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/visits` | Book a site visit |
| GET | `/visits` | Get user's visits |
| PUT | `/visits/:id/reschedule` | Reschedule a visit |
| DELETE | `/visits/:id` | Cancel a visit |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get user notifications |
| PUT | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete a notification |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Send text query to AI |
| GET | `/ai/suggestions` | Get smart suggestion chips |
| GET | `/ai/questionnaire/questions` | Get questionnaire steps |
| POST | `/ai/questionnaire` | Submit questionnaire answers |

**AI Chat Example:**
```json
POST /api/ai/chat
{
  "query": "2 BHK under 80 lakhs in Bangalore with gym"
}
```

---

## 🤖 AI Engine — How It Works

The AI uses a **100% custom rule-based NLP engine** — no OpenAI, Gemini, or any paid API:

```
User Input → Keyword Parser → MongoDB Query Builder → Property Results
```

**Supported query patterns:**
- BHK: "2 BHK", "3BHK", "studio", "villa"
- City: "Mumbai", "Bangalore", "Pune", "Delhi", "Hyderabad"
- Budget: "under 80 lakhs", "50L to 1Cr", "above 2 crore"
- Status: "ready to move", "under construction", "new launch"
- Amenities: "with pool", "gym", "parking", "garden"
- Luxury: "luxury", "premium"

---

## 🗃️ Database Schema

### User
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "phone": "string",
  "locationPreference": "string",
  "preferredTypes": ["string"],
  "budgetRange": { "min": "number", "max": "number" },
  "notificationPrefs": { "newPropertyAlerts": "boolean", ... }
}
```

### Property
```json
{
  "title": "string",
  "price": "number (in Lakhs)",
  "priceUnit": "Lakh | Crore",
  "type": "Apartment | Villa | Studio | Penthouse | Plot",
  "bhk": "number",
  "sqft": "number",
  "status": "Ready to Move | Under Construction | New Launch",
  "location": { "city": "string", "area": "string", "state": "string" },
  "images": ["string (URL)"],
  "amenities": ["string"],
  "isVerified": "boolean",
  "isFeatured": "boolean",
  "builder": { "name": "string", "phone": "string", "rating": "number" },
  "constructionProgress": { "stages": [...], "completionPercent": "number" },
  "rating": "number"
}
```

---

## 🏛️ Architecture

```
┌─────────────────────────────────┐
│     React Native App (Expo)     │
│  Expo Router │ Zustand │ Axios  │
└────────────────┬────────────────┘
                 │ HTTP REST
┌────────────────▼────────────────┐
│       Express.js API Server     │
│  Routes │ Controllers │ JWT MW  │
└────────────────┬────────────────┘
                 │ Mongoose ODM
┌────────────────▼────────────────┐
│           MongoDB Atlas          │
│  Users │ Properties │ Visits    │
└─────────────────────────────────┘
```

---

## 📸 Screens

| Screen | Description |
|--------|-------------|
| Onboarding | 3-slide animated intro |
| Login / Register | JWT auth with validation |
| Home | Featured carousel + property feed |
| Explore | Search + advanced filters |
| Saved | Bookmarked properties |
| Property Detail | Full info + image slider |
| Construction Progress | 6-stage visual tracker |
| Book Site Visit | Calendar + time slot picker |
| AI Assistant | Chat + guided questionnaire |
| Notifications | Alerts with read/delete |
| Profile | Edit + preferences + visits |

---

## 🔮 Future Enhancements

- Push notifications (Expo Notifications + FCM)
- Virtual 360° property tours
- Real AI integration (Gemini API)
- Dark mode
- EMI/Loan calculator
- Property comparison tool
- In-app builder messaging
- Google Maps integration

---

## 👨‍💻 Submission

- **GitHub:** https://github.com/sudha-sa/real-estate-app
- **Tech Stack:** React Native (Expo) + Node.js + MongoDB
- **Deadline:** 14th July, 10:00 PM

---

*Built with ❤️ for the React Native Developer Assessment*
