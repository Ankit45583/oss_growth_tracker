# 🚀 OSS Growth Tracker (GitHub Developer Analytics Platform)

A full-stack MERN application that transforms GitHub activity into meaningful insights, gamification, and shareable developer progress.

---

## 🔥 Features

* 🔐 GitHub OAuth Login
* 📊 Dashboard with commits, streaks, and insights
* 📂 Repository Explorer with search & filters
* 🏆 Leaderboard based on contribution activity
* 🔥 Streak Tracking System
* 🏅 Badge & Achievement System
* 📈 Developer Insights & Tips
* 🎴 GitHub Wrapped Shareable Card

---

## 🧠 Project Idea

GitHub already provides raw contribution data, but this platform focuses on:

* Converting raw data into **meaningful insights**
* Tracking **developer growth over time**
* Adding **gamification (badges, streaks, leaderboard)**
* Enabling **shareable developer achievements**

---

## 📸 Screenshots
---


### 🔐 Authentication Page

 <img width="1786" height="873" alt="Screenshot 2026-04-20 223840" src="https://github.com/user-attachments/assets/a7097c11-b5ac-4a3a-8c9a-f969b11ce2b1" />


👉 Users can securely log in using GitHub OAuth or email/password.

---

### 📊 Dashboard Overview

<img width="1893" height="872" alt="Screenshot 2026-04-20 224244" src="https://github.com/user-attachments/assets/db7933bb-4adb-4b70-86c0-5b326df8ce30" />


👉 Displays:

* Total repositories
* Total commits
* Current streak
* Longest streak
* Developer score

👉 Includes:

* GitHub connection status
* Refresh data option
* Wrapped card generation button

---

### 🏅 Badges & Insights

<img width="1865" height="872" alt="Screenshot 2026-04-20 224304" src="https://github.com/user-attachments/assets/27d7c531-b87f-4181-9bdd-8c186a1ba19f" />


👉 Shows:

* Badge level (Beginner → Intermediate → Pro → Legend)
* Progress bar toward next level
* Smart insights like:

  * Commit daily
  * Improve streak
  * Climb leaderboard

---

### 📂 Repositories Page

<img width="1843" height="873" alt="Screenshot 2026-04-20 224339" src="https://github.com/user-attachments/assets/1af8ca57-01a9-42b2-abf8-1107cef8a016" />

👉 Features:

* View all repositories
* Search & filter repos
* See stars, forks, and language
* Sort by recent activity

---

### 🏆 Leaderboard

<img width="1848" height="872" alt="Screenshot 2026-04-20 224407" src="https://github.com/user-attachments/assets/8040d9c3-7738-4d96-b170-f59d5db78956" />

👉 Displays:

* Top contributors
* Ranking based on commits
* Badge levels
* Competitive environment

---

### 🎴 GitHub Wrapped Card (Shareable Feature)

<img width="1596" height="835" alt="Screenshot 2026-04-20 224852" src="https://github.com/user-attachments/assets/577b198b-a470-4ce8-ac12-5839a6012529" />

👉 A personalized developer summary card inspired by “Spotify Wrapped”.

#### 🔥 Displays:

* Total commits
* Longest streak
* Total repositories
* Top programming language
* Most active month
* Developer score & badge

#### 🚀 Actions:

* 📥 Download as PNG
* 🔗 Generate shareable link
* 🐦 Share on Twitter
* 💼 Share on LinkedIn

👉 This feature highlights **product thinking and real-world usability**, making developer progress shareable.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Integrations & Tools

* GitHub API (OAuth + Data fetching)
* Cloudinary (image hosting)
* Puppeteer (image generation)
* Node-cron (scheduled data sync)

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/oss_growth_tracker.git
cd oss_growth_tracker
```

---

### 2. Backend setup

```bash
cd backend
npm install
npm run dev
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside backend:

```env
MONGO_URI=your_mongodb_uri
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Future Enhancements

* 🤖 AI-based repository insights
* 👥 Friend-based leaderboard
* 📅 Yearly GitHub Wrapped
* 📊 Contribution heatmap analytics

---

## 💡 Author

**Ankit Maurya**

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
