# 🚀 BuildStack – Developer Project & Deployment Tracker

BuildStack is a full-stack MERN application that helps developers **manage projects, track deployments, and authenticate securely** using OTP, password-based login, and OAuth (Google & GitHub).

---

## 🌐 Live Link

* 🔗https://buildstack-tan.vercel.app/

---

## 🎯 Features

### 🔐 Authentication System

* Email + Password login
* OTP verification (Email via Gmail API)
* Forgot Password (OTP-based reset)
* Google OAuth login
* GitHub OAuth login
* JWT-based authentication
* Protected routes

---

### 📦 Project Management (Core Idea)

* Add and manage projects
* Track deployment status:

  * Live
  * Failed
  * In Progress
* Dashboard overview

---

### 🎨 UI/UX

* Modern SaaS design
* Responsive (mobile + desktop)
* Clean and minimal interface
* Premium auth experience

---

## 🧱 Tech Stack

### Frontend

* React.js (Vite)
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Authentication

* JWT
* Bcrypt
* Passport.js (Google + GitHub OAuth)
* Gmail API (OAuth2) for OTP emails

### Deployment

* Frontend: Vercel
* Backend: Render

---

## 🔑 Environment Variables

### Backend (.env)

```env
MONGO_URI=
JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_EMAIL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

FRONTEND_URL=https://buildstack-tan.vercel.app
```

---

## ⚙️ Installation (Local Setup)

### 1. Clone Repo

```bash
git clone https://github.com/your-username/buildstack.git
cd buildstack
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Authentication Flow

```text
Landing Page
   ↓
Sign In / Sign Up / OAuth
   ↓
(OTP Verification if required)
   ↓
Dashboard (Protected)
```

---

## 🔒 Security Features

* Password hashing (bcrypt)
* OTP expiry & one-time usage
* JWT authentication
* Secure OAuth flow
* Environment-based configuration

---

## 🚀 Future Improvements

* CI/CD pipeline (GitHub Actions)
* Docker support
* AWS deployment (EC2 + S3)
* Role-based access
* Project analytics dashboard

---

## 👩‍💻 Author

Vishakha Mane
BBA(CA) Student | Full Stack Developer

---

## ⭐ Contribution

Feel free to fork, improve, and contribute to BuildStack.

---

## 📌 License

This project is open-source and available under the MIT License.
