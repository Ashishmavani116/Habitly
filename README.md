# ⚡ Habitly — AI-Powered Habit Tracker

## 📋 Project Summary

**Habitly** is a full-stack web application that helps users build and maintain daily habits through visual tracking, progress analytics, and AI-generated insights. Built as a mini project for the Web Technology course (ITVSE406), Habitly combines a colorful, energetic frontend with a robust Node.js/Express backend and MongoDB database, topped with real AI coaching powered by the Claude API.

---

## 🎯 Objective

To provide users with a simple yet powerful tool to:
- Track daily habits with one-tap check-ins
- Visualize progress through interactive charts
- Receive personalized AI suggestions and interpretations

---

## 🗂️ Project Structure

```
habitly/
│
├── server.js              ← Express server entry point
├── package.json           ← Node.js dependencies
├── .env                   ← Environment variables (MongoDB URI, API key)
│
├── models/
│   └── Habit.js           ← Mongoose schema for habits
│
├── routes/
│   ├── habits.js          ← REST API routes (CRUD)
│   └── insights.js        ← AI insights route (Claude API)
│
└── public/                ← Frontend (served as static files)
    ├── index.html         ← Main HTML page (single-page app)
    ├── css/
    │   └── style.css      ← All styles (dark theme, animations)
    └── js/
        └── app.js         ← All frontend logic (fetch, render, charts)
```

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Charts     | Chart.js (Line, Bar, Radar)       |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB + Mongoose                |
| AI Engine  | Anthropic Claude API              |
| Fonts      | Google Fonts (Boogaloo + Nunito)  |

---

## ✨ Features

### 🏠 Dashboard
- Daily habit check-in with one tap
- 7-day history grid per habit (visual dots)
- Streak tracking with fire badge 🔥
- Live progress bar for today's completion
- Summary cards: progress %, total habits, best streak
- Add / Edit / Delete habits
- Custom emoji & color picker per habit

### 📊 Charts Page (3 Chart Types)
- **Line Chart** — Daily completion percentage over 7 days
- **Bar Chart** — Stacked habits completed per day
- **Radar Chart** — Weekly habit strength across all habits
- **Scorecards** — Individual habit progress bars (X/7 days)

### 🤖 AI Insights Page
- Sends last-7-day data to Claude AI
- Receives:
  - Performance interpretation (encouraging & honest)
  - 2–3 actionable improvement suggestions
  - Motivational quote
- Powered by `claude-sonnet-4-20250514`

---

## 🔌 API Endpoints

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/habits`          | Get all habits               |
| POST   | `/api/habits`          | Create a new habit           |
| PUT    | `/api/habits/:id`      | Update habit name/emoji/color|
| PATCH  | `/api/habits/:id/toggle` | Toggle today's check-in    |
| DELETE | `/api/habits/:id`      | Delete a habit               |
| POST   | `/api/insights`        | Get AI insights from Claude  |

---

## 🗄️ Database Schema

```javascript
// Habit Model (MongoDB)
{
  name:      String,         // Habit name
  emoji:     String,         // Display emoji
  color:     String,         // Hex color code
  streak:    Number,         // Current consecutive day streak
  history:   Map<String, Boolean>, // Date → done (true/false)
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API Key

### Steps

```bash
# 1. Go to project folder
cd habitly

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Edit .env file:
#   MONGO_URI=mongodb://localhost:27017/habitly
#   PORT=3000
#   ANTHROPIC_API_KEY=your_key_here

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3000
```

---

## 📚 Course Outcomes Covered

| CO     | Outcome                                      | How Covered                            |
|--------|----------------------------------------------|----------------------------------------|
| 406.1  | Static & Dynamic website with HTML/CSS       | index.html + style.css (dark UI)       |
| 406.2  | Web scripting languages                      | app.js (DOM, fetch, Chart.js)          |
| 406.3  | Front End & Back End Technologies            | HTML/CSS/JS + Node.js/Express          |
| 406.4  | Web application using Node.js                | server.js, routes/                     |
| 406.5  | Web application using Express.js             | Express REST API with MongoDB          |

---

## 👨‍💻 Developed By

**Student:** Ashish  
**Institute:** AISSMS Institute of Information Technology  
**Course:** Web Technology (ITVSE406) — 2025 Pattern  
**Year:** Second Year Information Technology  

---

*Habitly — Build better habits, one day at a time. ⚡*
