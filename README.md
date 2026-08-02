# FounderOS Complete Production Backend Architecture

Production-ready Authentication, Venture Management, Idea Validation, MVP Scope, Build Roadmap, Marketing Plan, Launch Sprint, Traction Dashboard, Investor Update, and AI Assistant Backend for **FounderOS**, built with Node.js, Express.js, MongoDB, Mongoose, and JWT Authentication.

---

## 📁 Architecture Directory Structure

```text
backend/
│
├── src/
│   ├── config/
│   │     db.js                     # Database alias module
│   │     database.js               # MongoDB Mongoose database connection
│   │     env.js                    # Environment variable loader
│   │
│   ├── controllers/
│   │     authController.js         # Register, Login, Logout, and GetMe
│   │     ventureController.js      # Venture CRUD management
│   │     ideaValidationController.js# Idea Validation (Brief, Interviews, Insights, Notes, Progress)
│   │     mvpScopeController.js     # MVP Scope (Auto-prefill & Save/Update)
│   │     roadmapController.js      # Build Roadmap (Milestones & Timeline)
│   │     marketingController.js    # Marketing Plan (Auto-generation & Save/Update)
│   │     launchSprintController.js # Launch Sprint (7-Day default, Progress, Task CRUD)
│   │     tractionController.js     # Traction Dashboard (Metrics calculation & History)
│   │     investorUpdateController.js# Investor Update (Factual generation, Text/Summary export)
│   │     chatController.js         # AI Chat Assistant (Contextual messaging & history)
│   │
│   ├── middleware/
│   │     authMiddleware.js         # JWT verification & req.user attachment
│   │     ventureMiddleware.js      # Venture ID validation & ownership enforcement
│   │     errorHandler.js           # Production global error handler & stack trace masking
│   │     rateLimiter.js            # Rate limiting for Auth, General APIs, and AI Chat
│   │     validationMiddleware.js   # Request validation runner
│   │
│   ├── models/
│   │     User.js                   # User model with bcrypt hashing
│   │     Venture.js                # Single Venture model with feature subdocuments
│   │     Chat.js                   # Chat model for storing AI conversations
│   │
│   ├── routes/
│   │     auth.js                   # Auth routes & validation rules
│   │     ventures.js               # Venture, Idea Validation, & Router mounting
│   │     mvpScope.js               # MVP Scope sub-routes
│   │     roadmap.js                # Build Roadmap sub-routes
│   │     marketing.js              # Marketing Plan sub-routes
│   │     launchSprint.js           # Launch Sprint & Task CRUD sub-routes
│   │     traction.js               # Traction Dashboard & History sub-routes
│   │     investorUpdate.js         # Investor Update & Export sub-routes
│   │     chat.js                   # AI Chat Assistant sub-routes
│   │
│   ├── services/
│   │     aiService.js              # AI prompt generator & workspace context extractor
│   │
│   ├── utils/
│   │     generateToken.js          # 7-day JWT signing utility
│   │
│   ├── app.js                      # Express app setup, rate limiting, NoSQL sanitize, health check
│   └── server.js                   # Server bootstrap & graceful shutdown listeners
│
├── .env                            # Active environment variables (git-ignored)
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies & scripts
└── README.md                       # Documentation & API reference
```

---

## 🛠️ Tech Stack & Dependencies

- **Core**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security Hardening**:
  - `helmet`: Security HTTP headers
  - `cors`: Configurable CORS origins (`CLIENT_URL`)
  - `express-rate-limit`: Rate limiting for Auth, API, and AI Chat
  - `express-mongo-sanitize`: Prevents NoSQL query injection
  - `cookie-parser`: Cookie support
- **Validation**: `express-validator`
- **Logging**: `morgan` (dev & production formats)

---

## 🚀 Getting Started

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your variables in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/founderos?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Run Production Server

```bash
npm start
```

---

## 📡 All Backend API Sub-Routes

- **`/api/auth`**: Authentication (Register, Login, Logout, GetMe)
- **`/api/ventures`**: Venture Management CRUD
- **`/api/ventures/:ventureId/idea-validation/*`**: Venture Brief, Interviews, Validation Insights, Founder Notes, Progress
- **`/api/ventures/:ventureId/mvp-scope`**: MVP Scope auto-prefill & custom save
- **`/api/ventures/:ventureId/roadmap`**: Build Roadmap & milestone tracking
- **`/api/ventures/:ventureId/marketing-plan`**: Marketing Plan auto-generation & custom save
- **`/api/ventures/:ventureId/launch-sprint`**: 7-Day Launch Sprint & task CRUD
- **`/api/ventures/:ventureId/traction`**: Traction Dashboard, metrics, & history
- **`/api/ventures/:ventureId/investor-update`**: Factual Investor Update, text export, & summary preview
- **`/api/chat`**: Contextual AI Assistant co-pilot
- **`/api/health`**: Production health status
