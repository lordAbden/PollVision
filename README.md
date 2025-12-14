# 🗳️ PollVision

### Website de vote et Sondage | Voting and Polling Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📑 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Real-Time Events](#-real-time-events-socketio)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**PollVision** is a modern, full-stack real-time voting and polling web application that enables users to participate in live polls and administrators to manage polling campaigns effectively. Built with cutting-edge technologies, PollVision offers a seamless, responsive, and engaging user experience.

### Key Features at a Glance

✨ **Real-time updates** via Socket.io for instant poll results  
🔐 **Secure authentication** with JWT and bcrypt  
👥 **Role-based access** for users and administrators  
🛠️ **Poll ownership** - Users can create and manage their own polls  
🎨 **Modern UI** with glassmorphism design and smooth animations  
📊 **Comprehensive analytics** for poll insights  
⚡ **Lightning-fast** performance with React 19 and Vite 7

---

## 🚀 Features

### 🔐 User Authentication
- **Register/Login System** with secure JWT token authentication
- **Password hashing** using bcrypt (10 rounds)
- **Token expiry** management (1-hour sessions)
- **Role-based access control** (User/Admin)

### 📊 Real-Time Polling
- **Live vote updates** using Socket.io for instant synchronization
- **Vote once per poll** with double-vote prevention mechanism
- **Real-time poll results** visible to all users instantly
- **Vote history tracking** for each user

### 👤 User Dashboard
- View all available polls (open and closed)
- **Create new polls** directly from the dashboard
- Participate in active polls
- View personal voting history
- **Manage own polls** (delete, toggle open/closed status)
- Profile management with full name and email

### 👑 Admin Dashboard
- **Create new polls** with multiple options
- **Schedule poll closing dates** for automatic closure
- **Open/Close polls** manually with status management
- **Delete polls** and associated data
- **View detailed analytics** including:
  - Individual voter information
  - Vote timestamps
  - Option distribution
  - Poll statistics

### ⏰ Auto-Close Polls
- Automatic poll closure at scheduled times
- Background job runs every minute to check closing dates
- Real-time notifications when polls close

### 🛠️ User Poll Management
- **Create polls from dashboard** - Users can create their own polls with a Create button
- **Delete own polls** - Poll creators can delete polls they created
- **Toggle poll status** - Poll owners can open/close their own polls
- **Owner controls on poll cards** - Management buttons visible only to poll creators
- **Full voting access** - Other users maintain voting capabilities on all polls

### 🚫 Double-Vote Prevention
- Unique database index prevents duplicate votes
- Server-side validation for vote integrity
- Client-side checks for better UX

### 📱 Responsive Modern UI
- **Glassmorphism design** with frosted glass effects
- **Animated backgrounds** powered by Framer Motion
- **Lucide React icons** for beautiful iconography
- **Fully responsive** layout for all devices
- **Dark-themed interface** for comfortable viewing

### 🎨 Animated Interactions
- Smooth page transitions
- Animated modals and cards
- Interactive hover effects
- Loading states and animations

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library for building user interfaces |
| **Vite** | 7.2.4 | Next-generation build tool and dev server |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Framer Motion** | 12.23.26 | Animation library for React |
| **Lucide React** | 0.561.0 | Beautiful icon library |
| **Socket.io-client** | 4.8.1 | Real-time bidirectional communication |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 5.1.0 | Fast, minimalist web framework |
| **Socket.io** | 4.8.1 | Real-time WebSocket server |
| **MongoDB** | 7.0.0 | NoSQL database for data storage |
| **jsonwebtoken** | 9.0.3 | JWT authentication implementation |
| **bcrypt** | 6.0.0 | Password hashing and security |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing middleware |

### Database

- **MongoDB** (Local instance on port 27017)
- Database name: `ApplicationVote`
- Collections: `utilisateurs`, `sondage`, `votes`

---

## 📁 Project Structure

```
PollVision/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── AdminDashboard.jsx      # Admin control panel
│   │   │   ├── AnimatedBackground.jsx  # Animated background component
│   │   │   ├── AuthForm.jsx            # Login/Register form
│   │   │   ├── CreatePollModal.jsx     # Poll creation modal
│   │   │   ├── Dashboard.jsx           # User dashboard
│   │   │   ├── PollDetailsModal.jsx    # Poll analytics modal
│   │   │   ├── ProfileModal.jsx        # User profile modal
│   │   │   └── VoteModal.jsx           # Vote casting modal
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   ├── socket.js           # Socket.io client configuration
│   │   └── index.css           # Global styles (Tailwind)
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── eslint.config.js        # ESLint configuration
│   └── package.json            # Frontend dependencies
├── server.js                   # Express backend server & Socket.io
├── package.json                # Backend dependencies
├── package-lock.json           # Backend dependency lock
└── README.md                   # This file
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js) or **yarn**
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🔧 Installation & Setup

Follow these steps to get PollVision running on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/lordAbden/PollVision.git
cd PollVision
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Start MongoDB

Make sure MongoDB is running on your local machine:

**On Linux/macOS:**
```bash
sudo systemctl start mongod
# or
mongod
```

**On Windows:**
```bash
net start MongoDB
# or run mongod.exe from the MongoDB installation directory
```

**Verify MongoDB is running:**
```bash
mongosh
# If connected successfully, you should see the MongoDB shell
```

### 5. Start the Backend Server

From the root directory:

```bash
node server.js
```

You should see:
```
✅ Connecté à MongoDB
🚀 Serveur Socket.io lancé sur http://localhost:3000
```

### 6. Start the Frontend Development Server

Open a new terminal window/tab and run:

```bash
cd client
npm run dev
```

You should see:
```
VITE v7.2.4  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 8. Create Admin Account (Optional)

To access admin features, register a new account with the username `admin`. The system automatically assigns admin privileges to this username.

---

## ⚙️ Environment Configuration

### Backend Configuration

The backend server uses the following default configuration (defined in `server.js`):

```javascript
MongoDB URI: mongodb://127.0.0.1:27017
Database Name: ApplicationVote
Backend Port: 3000
JWT Secret: secret_scolaire_super_securise (⚠️ Change in production!)
```

### Frontend Configuration

The frontend connects to:

```javascript
Backend API: http://localhost:3000
Frontend Port: 5173 (Vite default)
```

### CORS Configuration

CORS is configured to accept requests from:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

### Production Environment Variables

**⚠️ Important for Production:**

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://your-production-mongodb-uri

# Server Configuration
PORT=3000

# Security
JWT_SECRET=your-super-secure-random-jwt-secret-here

# CORS Origins
CORS_ORIGIN=https://your-frontend-domain.com
```

**Note:** Never commit the `.env` file to version control. Add it to `.gitignore`.

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| `POST` | `/api/register` | ❌ | - | Create a new user account |
| `POST` | `/api/login` | ❌ | - | Authenticate user and receive JWT token |

### Poll Endpoints (User)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| `GET` | `/api/sondages` | ✅ | Any | Get all polls with voted status |
| `POST` | `/api/sondages` | ✅ | Any | Create a new poll |
| `POST` | `/api/vote` | ✅ | Any | Cast a vote on a poll |
| `GET` | `/api/user/votes` | ✅ | Any | Get user's voting history |
| `PATCH` | `/api/sondages/:id/status` | ✅ | Owner/Admin | Open or close a poll (owner or admin only) |
| `DELETE` | `/api/sondages/:id` | ✅ | Owner/Admin | Delete a poll and associated votes (owner or admin only) |

### Poll Management Endpoints (Admin Only)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| `GET` | `/api/sondages/:id/details` | ✅ | Admin | Get detailed poll analytics |

**Note:** Poll creators (owners) can now create polls and manage their own polls (delete, toggle status). Admin users retain full access to all polls and analytics.

### Request/Response Examples

#### POST /api/register

**Request Body:**
```json
{
  "nomUtilisateur": "john_doe",
  "motDePasse": "securePassword123",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "Utilisateur enregistré avec succès",
  "userId": "657abc123def456789012345"
}
```

#### POST /api/login

**Request Body:**
```json
{
  "nomUtilisateur": "john_doe",
  "motDePasse": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "nomUtilisateur": "john_doe",
    "fullName": "John Doe",
    "role": "utilisateur"
  }
}
```

#### POST /api/vote

**Request Headers:**
```
Authorization: your-jwt-token-here
```

**Request Body:**
```json
{
  "sondageId": "657abc123def456789012345",
  "optionIndex": 1
}
```

**Response:**
```json
{
  "message": "Vote pris en compte"
}
```

#### POST /api/sondages (Create Poll - Admin)

**Request Headers:**
```
Authorization: admin-jwt-token-here
```

**Request Body:**
```json
{
  "question": "What is your favorite programming language?",
  "options": ["JavaScript", "Python", "Java", "C#"],
  "closingDate": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "message": "Sondage créé",
  "id": "657abc123def456789012345"
}
```

---

## 🗄️ Database Schema

### Collection: `utilisateurs` (Users)

```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  nomUtilisateur: String,           // Username (unique)
  motDePasse: String,               // Hashed password (bcrypt)
  email: String,                    // User email
  fullName: String,                 // User's full name
  role: String,                     // "utilisateur" or "admin"
  dateCreation: Date                // Account creation timestamp
}
```

**Indexes:**
- Username (implicit via unique queries)

### Collection: `sondage` (Polls)

```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  question: String,                 // Poll question
  options: [                        // Array of poll options
    {
      label: String,                // Option text
      votes: Number                 // Vote count for this option
    }
  ],
  createdBy: String,                // Creator's full name or username
  status: String,                   // "open" or "closed"
  dateCreation: Date,               // Poll creation timestamp
  closingDate: Date | null,         // Optional scheduled closing date
  wasReopened: Boolean              // Flag if poll was reopened
}
```

**Indexes:**
- Status + closingDate (for auto-close functionality)

### Collection: `votes` (Vote Records)

```javascript
{
  _id: ObjectId,                    // MongoDB generated ID
  userId: ObjectId,                 // Reference to utilisateurs._id
  sondageId: ObjectId,              // Reference to sondage._id
  optionIndex: Number,              // Index of chosen option
  date: Date                        // Vote timestamp
}
```

**Indexes:**
- `{ userId: 1, sondageId: 1 }` - **Unique composite index** (prevents double voting)

---

## 🔌 Real-Time Events (Socket.io)

PollVision uses Socket.io for real-time bidirectional communication between the server and clients.

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pollUpdated` | `{ sondageId: String }` | Emitted when a vote is cast on a specific poll. Clients should refetch poll data. |
| `pollListUpdated` | None | Emitted when polls are created, deleted, or their status changes. Clients should refetch the entire poll list. |

### Client-Side Implementation

The Socket.io client is configured in `client/src/socket.js`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
  autoConnect: true
});

export default socket;
```

### Usage Example

```javascript
import socket from './socket';

// Listen for poll updates
socket.on('pollUpdated', ({ sondageId }) => {
  console.log(`Poll ${sondageId} was updated`);
  // Refetch poll data
});

// Listen for poll list updates
socket.on('pollListUpdated', () => {
  console.log('Poll list updated');
  // Refetch all polls
});
```

---

## 🔒 Security Features

PollVision implements multiple layers of security to protect user data and ensure system integrity:

### 🔐 Password Security
- **Bcrypt hashing** with 10 salt rounds
- Passwords are never stored in plain text
- One-way hashing prevents password recovery

### 🎫 JWT Authentication
- **JSON Web Tokens** for stateless authentication
- Token expiry: **1 hour** (configurable)
- Tokens include user ID, username, full name, and role
- Server-side token verification on protected routes

### 🛡️ CORS Protection
- Configured CORS middleware restricts API access
- Only whitelisted origins can make requests:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Credentials support enabled for cookie-based auth (if needed)

### 🚫 Double-Vote Prevention
- **Unique composite index** on `(userId, sondageId)` in votes collection
- Database-level constraint prevents duplicate votes
- Server-side validation as additional layer
- Client-side checks for better UX

### 👮 Role-Based Access Control (RBAC)
- Middleware functions verify user roles
- Admin-only endpoints protected with `verifyAdmin` middleware
- Users can only access their own data
- Automatic admin role assignment for username "admin"

### 🔍 Input Validation
- Server-side validation for all user inputs
- Required fields checked before processing
- Type validation for dates and indexes
- Array length validation for poll options

### 🧹 Data Cleanup
- Orphaned votes are deleted when polls are removed
- Prevents database bloat and maintains referential integrity

### ⏰ Automatic Poll Closure
- Scheduled closure prevents tampering with poll deadlines
- Background job runs independently of user actions
- Real-time notifications when polls close

---

## 📸 Screenshots

> **Note:** Screenshots will be added in future updates to showcase the application's user interface.

Planned screenshots:
- 🔐 Login/Register page
- 📊 User dashboard with active polls
- 🗳️ Voting modal
- 👑 Admin dashboard
- 📈 Poll analytics view
- 📱 Mobile responsive views

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help improve PollVision:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/lordAbden/PollVision.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Comment complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and feedback

### Code Style Guidelines

- **Frontend**: Follow React best practices and ESLint configuration
- **Backend**: Use consistent ES6+ JavaScript syntax
- **Commits**: Write descriptive commit messages
- **Documentation**: Update README.md if adding new features

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 lordAbden

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**lordAbden**

- GitHub: [@lordAbden](https://github.com/lordAbden)
- Repository: [PollVision](https://github.com/lordAbden/PollVision)

---

## 🙏 Acknowledgments

PollVision is built with amazing open-source technologies. Special thanks to:

### Frontend Technologies
- **[React](https://reactjs.org/)** - The library for web and native user interfaces
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animation library
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icon toolkit

### Backend Technologies
- **[Node.js](https://nodejs.org/)** - JavaScript runtime built on Chrome's V8
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[Socket.io](https://socket.io/)** - Real-time bidirectional event-based communication
- **[MongoDB](https://www.mongodb.com/)** - The most popular NoSQL database

### Security & Authentication
- **[JWT](https://jwt.io/)** - JSON Web Tokens for secure authentication
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing library

### Development Tools
- **[ESLint](https://eslint.org/)** - Pluggable JavaScript linter
- **[PostCSS](https://postcss.org/)** - A tool for transforming CSS with JavaScript

---

<div align="center">

### ⭐ If you find this project useful, please consider giving it a star!

**Made with ❤️ by lordAbden**

</div>
