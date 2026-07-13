# 🏠 PropFinder — Real Estate Mobile App

A full-stack real estate mobile application built with **React Native (Expo)** and **Node.js + Express + MongoDB**.

![App Theme](https://via.placeholder.com/800x200/4169E1/FFFFFF?text=PropFinder+%E2%80%94+Real+Estate+App)

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo Managed) |
| Navigation | Expo Router (file-based) |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| AI Feature | Rule-based NLP Engine (no external API needed) |

---

## ✨ Features

- 🔐 **Authentication** — Register, Login, JWT-based session management
- 🏠 **Home** — Featured carousel, property feed, city filters
- 🔍 **Explore** — Advanced search with filters (BHK, price, city, status, amenities)
- ❤️ **Saved** — Save/unsave properties with persistent bookmarks
- 🤖 **AI Assistant** — Text chat + interactive questionnaire for property recommendations
- 📋 **Property Detail** — Full property info, image carousel, amenities, builder contact
- 🏗️ **Construction Progress** — 6-stage visual timeline with status indicators
- 📅 **Site Visit Booking** — Calendar date selection, time slots, confirmation
- 👤 **Profile Management** — Edit profile, preferences, notification settings
- 📊 **My Visits** — Upcoming & past visits with reschedule/cancel

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (free) or local MongoDB
- Expo Go app on your phone (for testing)

---

## ⚙️ Backend Setup

### 1. Navigate to backend directory

```bash
cd real-estate-app/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/realestatedb
JWT_SECRET=real_estate_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas Setup:**
> 1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
> 2. Create a free cluster
> 3. Create a database user
> 4. Whitelist your IP (0.0.0.0/0 for dev)
> 5. Copy the connection string to MONGODB_URI

### 4. Seed the database

```bash
npm run seed
```

This creates:
- ✅ 15 property listings (Mumbai, Bangalore, Pune, Delhi, Hyderabad)
- ✅ 2 test user accounts
- ✅ Sample notifications and site visits

### 5. Start the backend

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

---

## 📱 Mobile App Setup

### 1. Navigate to mobile directory

```bash
cd real-estate-app/mobile
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure API URL

Open `constants/api.ts` and set your machine's local IP:

```typescript
const LOCAL_IP = '192.168.1.100'; // Replace with your IP
```

To find your IP:
```bash
# Mac/Linux
ipconfig getifaddr en0

# Windows
ipconfig
```

### 4. Start the Expo app

```bash
npx expo start
```

### 5. Run on device

- **iOS/Android Phone**: Install [Expo Go](https://expo.dev/client) and scan the QR code
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal

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
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login & get JWT |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/change-password` | Change password |

### Property Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List with filters |
| GET | `/properties/featured` | Featured properties |
| GET | `/properties/:id` | Property detail |
| GET | `/properties/saved` | User's saved list |
| POST | `/properties/:id/save` | Save property |
| DELETE | `/properties/:id/save` | Unsave property |

### Query Parameters for GET /properties
```
?city=Mumbai&bhk=3&status=Ready to Move&minPrice=50&maxPrice=200&sort=price_asc&page=1&limit=10
```

### Site Visit Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/visits` | Book site visit |
| GET | `/visits` | Get user's visits |
| PUT | `/visits/:id/reschedule` | Reschedule visit |
| DELETE | `/visits/:id` | Cancel visit |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | AI text query |
| POST | `/ai/questionnaire` | Process questionnaire answers |
| GET | `/ai/suggestions` | Get smart suggestions |
| GET | `/ai/questionnaire/questions` | Get questionnaire questions |

---

## 🗄️ Database Schema

### User
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "phone": "string",
  "avatar": "string",
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
  "price": "number",
  "priceUnit": "Lakh | Crore",
  "type": "Apartment | Villa | Studio | Penthouse | Plot",
  "bhk": "number",
  "sqft": "number",
  "status": "Ready to Move | Under Construction | New Launch",
  "location": { "city": "string", "area": "string", "state": "string" },
  "images": ["string"],
  "amenities": ["string"],
  "isVerified": "boolean",
  "isFeatured": "boolean",
  "builder": { "name": "string", "phone": "string", "rating": "number" },
  "constructionProgress": { "stages": [...], "completionPercent": "number" }
}
```

---

## 🤖 AI Feature

The AI assistant uses a **rule-based NLP engine** (no external API/key required):

1. **Text Search**: Parses keywords from natural language (BHK type, city, budget, status, amenities) and builds MongoDB query
2. **Questionnaire**: 5-step guided questionnaire (budget → type → city → amenities → timeline) → returns matching properties
3. **Smart Suggestions**: Pre-defined suggestion chips for quick searches

Example queries:
- *"3 BHK under 80 lakhs in Bangalore"*
- *"luxury villa with swimming pool in Mumbai"*
- *"ready to move 2 BHK in Pune"*

---

## 📂 Project Structure

```
real-estate-app/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth middleware
│   │   ├── seed/            # DB seed script
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── app/                 # Expo Router screens
│   │   ├── (auth)/          # Login, Register
│   │   ├── (tabs)/          # Bottom tabs
│   │   ├── property/        # Property screens
│   │   ├── ai-assistant.tsx
│   │   ├── notifications.tsx
│   │   └── onboarding.tsx
│   ├── components/          # Reusable UI components
│   ├── stores/              # Zustand state
│   ├── services/            # API service
│   ├── constants/           # Theme, API config
│   └── package.json
└── README.md
```

---

## 📊 Database Dump

The `database/dump/` directory contains a MongoDB data export.

### Import the dump:
```bash
# Using mongorestore
mongorestore --uri="your-mongodb-uri" database/dump/

# Or using mongoimport for individual collections
mongoimport --uri="your-uri" --collection=properties --file=database/dump/properties.json
```

---

## 🏗️ Architecture Decisions

- **Expo Managed Workflow**: Fastest setup, OTA updates, cross-platform support
- **Zustand**: Lightweight state management, minimal boilerplate vs Redux
- **Expo Router**: File-based routing (similar to Next.js), clean URL structure
- **JWT Auth**: Stateless authentication, stored in AsyncStorage
- **MongoDB Atlas**: Managed cloud DB, free tier sufficient for demo
- **Rule-based AI**: No API key required, works offline, deterministic results

---

## 🔮 Future Enhancements

- Virtual 360° property tours
- Real AI (OpenAI/Gemini) integration  
- Dark mode support
- Push notifications (Expo Notifications)
- Property comparison tool
- EMI/Loan calculator
- Builder ratings & reviews
- In-app messaging with builder

---

## 👨‍💻 Developer

Built as part of React Native Developer Assessment

---

*Made with ❤️ using React Native + Node.js*
