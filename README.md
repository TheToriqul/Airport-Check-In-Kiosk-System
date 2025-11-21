<div align="center">

# ✈️ Airport Check-In Kiosk System

**Concurrent • Real-Time • Fault-Tolerant**

[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System) [![Stars](https://img.shields.io/github/stars/TheToriqul/Airport-Check-In-Kiosk-System?style=social&logo=starship)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/stargazers) [![Forks](https://img.shields.io/github/forks/TheToriqul/Airport-Check-In-Kiosk-System?style=social&logo=git)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/forks) [![Issues](https://img.shields.io/github/issues/TheToriqul/Airport-Check-In-Kiosk-System?color=red&logo=issuestotal)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/issues) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/pulls) [![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg?logo=opensourceinitiative)](LICENSE)

---

> **A real-time self-service airport check-in kiosk system**  
> Demonstrates **concurrency control**, **synchronization**, and **real-time data integrity** — aligned with **PRG4201E LO3 (Concurrent & Real-Time Systems)**.

</div>

---

## 🎯 **Core Objective**

Simulate **50–100+ concurrent kiosks** during peak hours with **zero double-bookings**, **atomic baggage tracking**, and **sub-second seat availability sync** — all while maintaining **auditability**, **fault tolerance**, and **real-time UX**.

<details>
<summary>📊 Quick Stats & Metrics</summary>

| Metric                | Target             |
| --------------------- | ------------------ |
| **Concurrent Users**  | 50–100+ kiosks     |
| **Seat Lock Time**    | < 1s               |
| **Booking Search**    | < 500ms            |
| **Boarding Pass Gen** | < 3s               |
| **Conflict Rate**     | 0% double-bookings |

</details>

---

## 🏛️ **Institution & Course**

| Field           | Details                                    |
| --------------- | ------------------------------------------ |
| **Institution** | INTI International University              |
| **Programme**   | Computer Science (BCSI-ODL)                |
| **Module**      | PRG4201E — Concurrent and Real-Time System |
| **Session**     | October 2025                               |
| **Student**     | Md Toriqul Islam (`i24029037`)             |

---

## ✨ **Key Features**

### **Core Functionality**

- **🔒 Concurrency-Safe Seat Selection** - Pessimistic locking with TTL-based locks (30s)
- **🌐 Real-Time Seat Map Sync** - WebSocket/STOMP for instant updates across all kiosks
- **⚡ Atomic Baggage Counters** - Synchronized increments with REPEATABLE_READ isolation
- **🧾 Boarding Pass Generation** - QR code generation with printable format, including airline and aircraft information
- **✈️ Airline & Aircraft Information** - Complete flight details with airline names and aircraft types (e.g., Boeing 787-9, Airbus A350-900)
- **🛠️ Fault Tolerance** - Comprehensive error handling and recovery
- **🔍 Case-Insensitive Search** - Booking reference and passport number validation (uppercase normalization)
- **🔄 Seat Replacement** - Automatic release of old seats when booking new ones (one seat per booking)
- **📊 Flight Details & Passenger Management** - Comprehensive flight information page with passenger details and boarding pass access
- **✅ Input Validation** - Frontend and backend validation with proper normalization
- **🔐 Thread-Safe Operations** - Synchronized methods and database transactions

### **Developer Experience**

- **🛠️ Permanent Java 21 Setup** - Automatic Java version management with convenience scripts
- **📝 Comprehensive Documentation** - Detailed setup guides and API documentation
- **🚀 Quick Start Scripts** - One-command application startup with `./app.sh` (or `app.bat` on Windows)
- **🔧 Shell Functions** - Easy Java version switching with `java21`/`java17` commands

---

## ⚙️ **Technology Stack**

| Layer                | Technology                                |
| -------------------- | ----------------------------------------- |
| **Frontend**         | React 19.2, TypeScript 5.9, Vite 7        |
| **Frontend UI**      | Tailwind CSS 3.4, Lucide React            |
| **State Management** | Zustand 5.0                               |
| **Backend**          | Java 21, Spring Boot 3.4.1                |
| **Database**         | PostgreSQL 17+                            |
| **ORM**              | Spring Data JPA, Hibernate                |
| **Migrations**       | Flyway 11.0                               |
| **WebSocket**        | Spring WebSocket (STOMP)                  |
| **Build Tool**       | Maven 3.10+ (Backend), npm 10+ (Frontend) |
| **Communication**    | REST API + WebSocket                      |

---

## 🚀 **How to Run the Application**

### **Prerequisites**

- **Java JDK 21** (LTS version) - **REQUIRED** for backend
  - Installation: `brew install openjdk@21` (macOS) or download from [Adoptium](https://adoptium.net/)
  - ⚠️ **Important:** The project includes permanent fixes for Java 21 setup (see `backend/JAVA_SETUP.md`)
- **Node.js 18.18+ or 20.9+** (Node.js 22+ LTS recommended) - Required for frontend
  - Installation: `brew install node` (macOS) or download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL 17+** - Database
  - Installation: `brew install postgresql@17` (macOS)
- **Maven 3.10+** - Backend build tool (usually comes with Java setup)
- **npm 10+** - Frontend package manager (comes with Node.js)

### **Step 1: Database Setup**

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql@17

# Create database
psql -U postgres
CREATE DATABASE airport_kiosk;
\q
```

### **Step 2: Configure Database Connection**

Update `backend/src/main/resources/application.properties` with your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/airport_kiosk
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### **Step 3: Install Dependencies (First Time Only)**

```bash
# Install root dependencies (for running both services)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### **Step 4: Run the Application**

#### **🚀 Option 1: Run Both Services Together (Recommended - Easiest)**

**Cross-platform solution - works on Mac, Linux, and Windows:**

```bash
# Mac/Linux:
./app.sh

# Windows:
app.bat

# Or using npm (works on all platforms):
npm start
# or
npm run dev
```

This will automatically start both:

- **Backend** on `http://localhost:8080`
- **Frontend** on `http://localhost:5173`

Press `Ctrl+C` to stop both services.

#### **Option 2: Run Services Separately**

**Start Backend:**

**⚠️ IMPORTANT:** This project requires **Java 21**.

##### **Option 2a: Use the Convenience Script (Recommended)**

```bash
cd backend
./run.sh                    # Automatically sets Java 21
```

##### **Option 2b: Manual Setup**

```bash
cd backend
source ./set-java21.sh
mvn spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

##### **Option 2c: Start Frontend**

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend will start on:** `http://localhost:5173`

---

### **Step 5: Access the Application**

1. Open your browser: `http://localhost:5173`
2. Test with sample data:
   - **Booking Reference:** `BK001` (case-insensitive)
   - **Passport Number:** `P12345678`

---

## 📂 **Project Structure**

```
Airport-Check-In-Kiosk-System/
├── backend/                    # Spring Boot Backend (Java 21)
│   ├── src/main/java/          # Source code
│   ├── src/main/resources/     # Configuration & migrations
│   ├── run.sh                  # Backend startup script
│   └── README.md               # Backend documentation
│
├── frontend/                   # React Frontend (TypeScript)
│   ├── src/                    # Source code
│   └── README.md               # Frontend documentation
│
├── scripts/                    # Startup scripts
│   └── start.js                # Cross-platform launcher
│
├── app.sh                      # Mac/Linux startup script
├── app.bat                     # Windows startup script
└── README.md                   # This file
```

---

## 🔌 **API Documentation**

For complete API documentation, see:

- **Backend API:** `backend/README.md`
- **Frontend API Integration:** `frontend/README.md`

**Main Endpoints:**

- Booking search and retrieval
- Seat map and assignments
- Baggage check-in
- Flight information (with airline and aircraft details)
- Boarding pass generation (with airline and aircraft information)

**WebSocket:** Real-time updates for seat status and baggage counts

---

## 🔬 **Concurrency Features**

- **Pessimistic Locking** - Seat locks with 30s TTL
- **Real-Time Updates** - WebSocket/STOMP for instant synchronization
- **Atomic Operations** - Database transactions with REPEATABLE_READ isolation
- **Thread-Safe** - Synchronized methods and proper concurrency control

---

## 📈 **Status**

✅ **Complete:** Backend, Frontend, Concurrency Features, Real-Time Updates  
⏳ **In Progress:** Testing

## 🔧 **Troubleshooting**

**Java Issues:** Use `backend/run.sh` or see `backend/JAVA_SETUP.md`  
**Database Issues:** Ensure PostgreSQL is running and credentials are correct  
**Connection Issues:** Verify backend is running on `http://localhost:8080`

---

## 🛡️ **License**

[MIT License](LICENSE) © 2025 Group - 1

---

<p align="center">
  <sub>Built with 🔥 by <a href="https://github.com/TheToriqul">TheToriqul</a> • 
  <a href="https://github.com/TheToriqul/Airport-Check-In-Kiosk-System">GitHub Repo</a> • 
  <a href="https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/issues">Issues</a> • 
  <a href="https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/pulls">PRs Welcome</a></sub>
</p>
