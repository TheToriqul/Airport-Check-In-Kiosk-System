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

- **🔒 Concurrency-Safe Seat Selection** - Pessimistic locking with TTL-based locks (30s)
- **🌐 Real-Time Seat Map Sync** - WebSocket/STOMP for instant updates across all kiosks
- **⚡ Atomic Baggage Counters** - Synchronized increments with REPEATABLE_READ isolation
- **🧾 Boarding Pass Generation** - QR code generation with printable format
- **🛠️ Fault Tolerance** - Comprehensive error handling and recovery
- **🔍 Case-Insensitive Search** - Booking reference and passport number validation (uppercase normalization)
- **🔄 Seat Replacement** - Automatic release of old seats when booking new ones (one seat per booking)
- **📊 Seat Assignments View** - Real-time passenger manifest with seat assignments
- **✅ Input Validation** - Frontend and backend validation with proper normalization
- **🔐 Thread-Safe Operations** - Synchronized methods and database transactions

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

- **Java JDK 21** (LTS version) - Required for backend
- **Node.js 22+** (LTS version) - Required for frontend
- **PostgreSQL 17+** - Database
- **Maven 3.10+** - Backend build tool
- **npm 10+** - Frontend package manager

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

### **Step 3: Start Backend**

```bash
cd backend

# Set Java 21 (IMPORTANT: Maven requires Java 21)
export JAVA_HOME=/opt/homebrew/opt/openjdk@21  # macOS Homebrew
# Or use the helper script:
source ./set-java21.sh

# Verify Java version
java -version  # Should show Java 21

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

**Note:** To make Java 21 permanent, add to `~/.zshrc` or `~/.bashrc`:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"
```

### **Step 4: Start Frontend**

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend will start on:** `http://localhost:5173`

### **Step 5: Access the Application**

1. Open your browser: `http://localhost:5173`
2. The application will automatically connect to the backend
3. Test with sample data:
   - **Booking Reference:** `BK001` (case-insensitive)
   - **Passport Number:** `P12345678`

### **Quick Test**

Run the connection test script:

```bash
./test-connection.sh
```

---

## 📂 **Project Structure**

```
Airport-Check-In-Kiosk-System/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/airport/kiosk/
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── service/         # Business logic with concurrency
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   ├── model/           # Entity classes
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── exception/       # Custom exceptions
│   │   │   │   └── config/          # Configuration (CORS, WebSocket, etc.)
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/                    # Test classes
│   ├── pom.xml                      # Maven dependencies
│   ├── set-java21.sh               # Java 21 setup script
│   └── README.md                    # Backend documentation
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── BookingSearch.tsx
│   │   │   ├── SeatMap.tsx
│   │   │   ├── BaggageCheckIn.tsx
│   │   │   ├── BoardingPass.tsx
│   │   │   ├── FlightDetailsPage.tsx
│   │   │   └── ...
│   │   ├── services/           # API and WebSocket services
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── store/              # Zustand state management
│   │   │   └── kioskStore.ts
│   │   ├── types/              # TypeScript definitions
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md               # Frontend documentation
│
├── docs/                       # Documentation
│   ├── assignment_requirements/
│   └── plan/
│
├── test-connection.sh          # Connection test script
├── README.md                   # This file
└── START.md                    # Quick start guide
```

---

## 🔌 **API Endpoints**

### **Health Check**

- `GET /api/health` - Service health status

### **Booking Endpoints**

- `POST /api/bookings/search` - Search booking by reference or passport (case-insensitive)
- `GET /api/bookings/{bookingId}` - Get booking details (case-insensitive)

### **Seat Endpoints**

- `GET /api/flights/{flightId}/seats` - Get seat map for a flight
- `GET /api/flights/{flightId}/seats/assignments` - Get seat assignments with passenger details
- `POST /api/flights/{flightId}/seats/{seatId}/lock` - Lock a seat (30s TTL)
- `POST /api/flights/{flightId}/seats/{seatId}/confirm` - Confirm seat selection (auto-releases old seats)
- `DELETE /api/flights/{flightId}/seats/{seatId}/unlock?sessionId={sessionId}` - Release seat lock

### **Baggage Endpoints**

- `POST /api/bookings/{bookingId}/baggage` - Check in baggage (case-insensitive booking lookup)
- `GET /api/flights/{flightId}/baggage/count` - Get baggage count for a flight

### **Boarding Pass Endpoints**

- `POST /api/bookings/{bookingId}/boarding-pass` - Generate boarding pass (case-insensitive)
- `GET /api/bookings/{bookingId}/boarding-pass/pdf` - Download boarding pass PDF

---

## 🌐 **WebSocket Endpoints**

- **WebSocket URL:** `ws://localhost:8080/ws`
- **Topics:**
  - `/topic/flights/{flightId}/seats` - Real-time seat status updates
  - `/topic/flights/{flightId}/baggage` - Real-time baggage count updates

---

## 🔬 **Concurrency Solutions**

| Challenge                            | Solution                                               |
| ------------------------------------ | ------------------------------------------------------ |
| **Race Condition on Seat Selection** | Pessimistic lock with TTL (30s) + synchronized methods |
| **Stale Seat Map**                   | WebSocket/STOMP for real-time updates                  |
| **Partial Failure**                  | Database transactions with rollback                    |
| **Simultaneous Baggage Updates**     | Atomic SQL increments + REPEATABLE_READ isolation      |
| **Multiple Seats Per Booking**       | Automatic seat replacement on confirm                  |
| **Case-Sensitivity Issues**          | Case-insensitive queries with normalization            |

---

## 🎓 **PRG4201E LO3 Alignment**

| LO3 Requirement                 | Evidence                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| **Synchronization Mechanisms**  | Pessimistic locking, synchronized blocks, database transactions |
| **Real-Time Data Distribution** | WebSocket/STOMP mechanism                                       |
| **Petri Net Modeling**          | Included in plan                                                |
| **Workload Matrix**             | 50-100 kiosks, peak load                                        |
| **Code Extracts**               | Backend Java code in plan                                       |

---

## 📈 **Current Status**

| Phase                    | Status      |
| ------------------------ | ----------- |
| Documentation & Planning | ✅ Complete |
| Backend Development      | ✅ Complete |
| Frontend Development     | ✅ Complete |
| Concurrency Features     | ✅ Complete |
| Real-Time Updates        | ✅ Complete |
| Input Validation         | ✅ Complete |
| Seat Management          | ✅ Complete |
| Seat Assignments API     | ✅ Complete |
| Testing                  | ⏳ Planned  |
| Final Submission         | 🎯 Week 7   |

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
