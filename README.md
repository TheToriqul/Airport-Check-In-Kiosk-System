<div align="center">

# ✈️ Airport Check-In Kiosk System

**Concurrent • Real-Time • Fault-Tolerant**

[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System) [![Stars](https://img.shields.io/github/stars/TheToriqul/Airport-Check-In-Kiosk-System?style=social&logo=starship)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/stargazers) [![Forks](https://img.shields.io/github/forks/TheToriqul/Airport-Check-In-Kiosk-System?style=social&logo=git)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/forks) [![Issues](https://img.shields.io/github/issues/TheToriqul/Airport-Check-In-Kiosk-System?color=red&logo=issuestotal)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/issues) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TheToriqul/Airport-Check-In-Kiosk-System/pulls) [![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg?logo=opensourceinitiative)](LICENSE)

---

> **A real-time self-service airport check-in kiosk system**  
> Demonstrates **concurrency control**, **synchronization**, and **real-time data integrity** — aligned with **PRG4201E LO3 (Concurrent & Real-Time Systems)**.

![System Overview](./assests/image/Animated%20demo%20of%20kiosk%20flow.gif)  
_Animated demo of kiosk flow: Booking search → Seat selection → Boarding pass generation._

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
- **🔍 Case-Insensitive Search** - Booking reference and passport number validation
- **🔄 Seat Replacement** - Automatic release of old seats when booking new ones
- **📊 Seat Assignments View** - Real-time passenger manifest with seat assignments
- **✅ Input Validation** - Frontend and backend validation with proper normalization

---

## 🏗️ **High-Level Architecture**

![Architecture Diagram](./assests/image/architecture_diagram.png)

> **Full architecture, sequence diagrams, Petri Nets, and DB schemas** → [`docs/plan/airport_kiosk_plan.md`](./docs/plan/airport_kiosk_plan.md)

---

## ⚙️ **Technology Stack**

| Layer             | Tech                                 |
| ----------------- | ------------------------------------ |
| **Frontend**      | React 19.2, TypeScript, Tailwind CSS |
| **Backend**       | Java 17 (Spring Boot)                |
| **Database**      | PostgreSQL 15+                       |
| **Communication** | REST API                             |
| **Testing**       | JUnit (Java), Jest (Frontend)        |

---

## 🚀 **Getting Started**

### **Prerequisites**

- **Backend**: Java JDK 17 (required) and Maven
- **Frontend**: Node.js LTS (`v20+`)

### **Setup**

#### **Quick Start (Recommended)**

Run everything with a single command:

```bash
git clone https://github.com/TheToriqul/Airport-Check-In-Kiosk-System.git
cd Airport-Check-In-Kiosk-System
./app.sh
```

This script will:

- ✅ Check prerequisites (Java 17+, Node.js)
- ✅ Start PostgreSQL database (if not running)
- ✅ Create database if it doesn't exist
- ✅ Start backend server (port 8080)
- ✅ Start frontend server (port 5173)
- ✅ Handle cleanup on exit (Ctrl+C)

#### **Manual Setup**

If you prefer to run services separately:

**Note**: Ensure Java 17 is installed and set as `JAVA_HOME` before running Maven commands.

```bash
# Backend (requires Java 17)
cd backend
# Set JAVA_HOME to Java 17 if not already set
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
# Or: export JAVA_HOME=/opt/homebrew/opt/openjdk@17  # Homebrew
mvn install
mvn spring-boot:run

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

> **Full setup guide** → [Implementation Plan](./docs/plan/airport_kiosk_plan.md)

---

## 📂 **Project Structure**

```
├── backend/              # Java backend
│   ├── src/
│   │   ├── main/java/
│   │   │   ├── controller/  # REST endpoints
│   │   │   ├── service/     # Business logic
│   │   │   ├── model/       # Data models
│   │   │   └── dao/         # Database access
│   │   └── test/
│   └── pom.xml
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API calls
│   │   └── hooks/        # React hooks
│   └── package.json
└── docs/
    ├── assignment_requirements.md
    └── plan/airport_kiosk_plan.md
```

---

## 🔬 **Concurrency Solutions**

| Challenge                            | Solution                                 |
| ------------------------------------ | ---------------------------------------- |
| **Race Condition on Seat Selection** | Pessimistic lock with TTL (30s)          |
| **Stale Seat Map**                   | WebSocket/polling for real-time updates  |
| **Partial Failure**                  | Transactions with rollback               |
| **Simultaneous Baggage Updates**     | Atomic counters with synchronized blocks |

> **Petri Net diagram and detailed implementation** → [Plan](./docs/plan/airport_kiosk_plan.md)

---

## ✅ **Testing**

| Type        | Tool       | Target                   |
| ----------- | ---------- | ------------------------ |
| Unit        | JUnit/Jest | Service layer coverage   |
| Integration | JUnit      | End-to-end check-in flow |
| Load        | Manual     | 50-100 concurrent kiosks |

---

## 📑 **Documentation Map**

| Document                  | Path                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Assignment Brief & Rubric | [`docs/assignment_requirements/assignment_requirements.md`](./docs/assignment_requirements/assignment_requirements.md) |
| **Full Technical Plan**   | [`docs/plan/airport_kiosk_plan.md`](./docs/plan/airport_kiosk_plan.md)                                                 |

---

## 🎓 **PRG4201E LO3 Alignment**

| LO3 Requirement                 | Evidence                                 |
| ------------------------------- | ---------------------------------------- |
| **Synchronization Mechanisms**  | Pessimistic locking, synchronized blocks |
| **Real-Time Data Distribution** | WebSocket/polling mechanism              |
| **Petri Net Modeling**          | Included in plan                         |
| **Workload Matrix**             | 50-100 kiosks, peak load                 |
| **Code Extracts**               | Backend Java code in plan                |

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
