# CarbonTwin AI – Personal Climate Intelligence Twin

CarbonTwin AI is a climate intelligence web application that helps individuals understand, track, and reduce their carbon footprint through simple daily actions and personalized insights.

The platform combines carbon footprint calculation, daily habit tracking, AI-powered suggestions, budget planning, missions, rewards, and progress visualization to make sustainability practical and engaging for everyday users.

## Live Demo

https://carbon-twin-ai-client.vercel.app

## Problem Statement

Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

## Solution Overview

CarbonTwin AI acts as a personal climate companion. It helps users calculate their baseline carbon footprint, track daily lifestyle choices, receive AI-powered suggestions, complete eco missions, and monitor progress over time.

The application focuses on four major lifestyle categories:

* Transport
* Electricity
* Food
* Shopping & Waste

Users can track their impact, set carbon goals, follow a monthly carbon budget, and receive personalized recommendations to reduce their footprint step by step.

## Key Features

### Baseline Carbon Footprint Calculator

Users can calculate their carbon footprint based on transport, electricity, food, and shopping/waste habits.

### Electricity Bill & Payment Screenshot Support

Users can upload an electricity bill or payment screenshot. The system extracts useful information and estimates electricity-related carbon emissions.

### Daily Eco Quest

A quick daily tracking system where users log simple lifestyle actions and build sustainable habits.

### AI Eco Coach

Provides personalized climate-friendly suggestions based on user data, goals, mood, budget, and difficulty preference.

### Carbon Dashboard

Displays carbon insights, category-wise usage, progress trends, saved CO₂, streaks, and monthly tracking.

### Carbon Budget Planner

Allows users to set a monthly carbon budget and track category-wise budget usage.

### Missions & Rewards

Users can complete eco missions, upload proof, verify actions, earn XP, LeafCoins, and unlock badges.

### CarbonTwin Avatar & World

A gamified progress system where the user’s CarbonTwin evolves based on sustainable actions and progress.

### Leaderboard & Battles

Users can participate in friendly challenges and compare impact with others.

### Persistent User Accounts

All user progress, logs, rewards, goals, missions, and preferences are stored securely and restored after login.

## Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication

### AI & OCR

* Gemini API
* Tesseract.js
* PDF parsing

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

## System Architecture

CarbonTwin AI follows a full-stack MERN-style architecture.

Frontend users interact with the React application deployed on Vercel. The frontend communicates with the Express backend through REST APIs. The backend handles authentication, carbon calculations, mission logic, AI suggestions, file validation, and database operations. MongoDB Atlas stores user profiles, logs, missions, rewards, budgets, and progress data.

## Folder Structure

```text
CarbonTwin-AI/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CarbonTwin-AI.git
cd CarbonTwin-AI
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=10000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_optional
```

Run backend:

```bash
npm run dev
```

Build backend:

```bash
npm run build
npm start
```

### 3. Setup Frontend

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_BASE_URL=http://localhost:10000/api
```

Run frontend:

```bash
npm run dev
```

## Deployment

### Backend Deployment

The backend is deployed on Render.

Required environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
GEMINI_API_KEY=your_gemini_api_key_optional
```

Render settings:

```text
Root Directory: server
Build Command: npm install --include=dev && npm run build
Start Command: npm start
```

### Frontend Deployment

The frontend is deployed on Vercel.

Vercel settings:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Frontend environment variable:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
```

## Security Features

* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* User-specific data access through userId
* Environment variables for secrets
* File type and size validation
* Proof and bill upload validation
* No sensitive keys exposed in frontend

## Accessibility and UX

* Guided onboarding flow
* Clear question-based input forms
* No default pre-selected lifestyle choices
* Friendly validation messages
* Loading, empty, and error states
* Responsive design
* Accessible labels and readable UI

## Problem Statement Alignment

CarbonTwin AI directly supports the problem statement by helping users:

### Understand

* Baseline carbon footprint calculator
* Dashboard insights
* Category-wise breakdown
* Carbon budget usage

### Track

* Daily Eco Quest
* Monthly progress
* Missions and badges
* User history and streaks

### Reduce

* AI Eco Coach
* Personalized goals
* Eco missions
* Budget suggestions
* Practical lifestyle actions

## Future Improvements

* Real-time electricity provider integrations
* More advanced AI vision-based proof validation
* Mobile app version
* Community challenges
* More detailed carbon factor datasets
* Regional carbon emission customization

## Author

Developed by Petrisha V

## License

This project is created for educational and challenge submission purposes.

