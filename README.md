# 🧠 Mentora AI  
### Intelligent Learning Companion Powered by AI

Mentora AI is a modern AI-powered learning platform designed to transform how students study, revise, and prepare for exams.

Built using React, TypeScript, Firebase, and Google Gemini, Mentora delivers personalized learning paths, real-time AI tutoring, and intelligent performance tracking — all in one seamless experience.

---

## ✨ Why Mentora AI?

Traditional learning platforms are static.  
Mentora AI is dynamic.

It:
- Understands your learning patterns
- Identifies weak areas
- Generates quizzes automatically
- Caches AI responses to reduce API costs
- Tracks performance in real-time
- Syncs progress across devices

This isn’t just an app.  
It’s your intelligent study partner.

---

## 🚀 Core Features

### 🤖 AI Tutor (Google Gemini Powered)
- Ask doubts in natural language
- Structured explanations with examples
- Context-aware responses
- Firestore-based AI response caching

### 📚 Adaptive Learning System
- Personalized study flow
- Skill gap analysis
- Smart topic recommendations

### 📝 Smart Quiz Engine
- Auto-generated quizzes
- Instant feedback
- Timed practice exams
- Performance analytics

### 📊 Progress Intelligence
- Topic-wise tracking
- Strength & weakness insights
- Smart revision suggestions

### ⏳ Productivity Tools
- Built-in Pomodoro Timer
- Auto logout with inactivity detection
- AI-generated study planner
- Revision tracking system

---

## 🏗 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend & Services
- Firebase Authentication
- Firestore (AI caching + user data)
- Realtime Database
- Google Gemini API

### Architecture Highlights
- Intelligent AI response caching system
- Exponential backoff for rate limits (429 handling)
- Secure user-scoped Firestore rules
- Component-based scalable architecture
- Cross-device real-time sync

---

## 🛠 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/warshit/Mentora-ai1.git
cd Mentora-ai1
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Environment File

Create a `.env.local` file in the root directory:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

App runs at:

```
http://localhost:3000
```

---

## 🔐 Firebase Setup

1. Create a project in Firebase Console  
2. Enable Email/Password Authentication  
3. Create Firestore Database  

Configure Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /aiHistory/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 📈 What This Project Demonstrates

- Full Stack Development  
- AI API Integration  
- Firebase Backend Integration  
- Performance Optimization  
- Secure Authentication Handling  
- Real-World Deployment Architecture  
- Scalable React Application Design  

---

## 🔮 Future Enhancements

- AI-powered mock interviews  
- Learning streak & gamification system  
- Peer study rooms  
- Advanced analytics dashboard  
- Offline caching support  

---

## 👨‍💻 Author

**Varshith Baddam**  
BTech Student | Full Stack Developer | AI Enthusiast  

Building scalable AI-powered applications focused on real-world impact.

---

⭐ If you like this project, consider giving it a star!
