# 🏥 Medica — Medical Appointment Management System

A full-stack medical appointment management platform built with **Java Spring Boot** and **Next.js**. Medica supports three user roles — Patient, Doctor, and Receptionist — each with their own dashboard and workflow. The system was originally built as a Java console application and later extended with a REST API and a modern web frontend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Design Patterns](#design-patterns)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Role Capabilities](#role-capabilities)

---

## Overview

Medica is a healthcare appointment system where:

- **Patients** browse doctors, send appointment requests, track their appointments, and view their medical history.
- **Receptionists** review incoming appointment requests, schedule them with conflict detection, manage all appointments, and cancel when needed.
- **Doctors** view their daily schedule, complete appointments by filling in medical details, and access the history of patients they have treated.

The project has two runnable entry points:

| Entry Point | Description |
|---|---|
| `MedicaApiApp` | Spring Boot REST API — powers the web frontend |
| `MedicaApp` | Console/CLI application — standalone terminal UI |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 3.2.3 | REST API framework |
| PostgreSQL (Supabase) | 42.7.3 | Database |
| jBCrypt | 0.4 | Password hashing |
| Jackson JSR310 | — | LocalDate/LocalTime JSON serialization |
| Maven | 3.9+ | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.0 | React framework (App Router) |
| React | 18.2.0 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4.1 | Styling |
| Lucide React | 0.363.0 | Icons |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Hosted PostgreSQL database |
| Render | Backend hosting (Docker container) |
| Vercel | Frontend hosting |
| Docker | Backend containerization |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                     │
│         (Vercel — next.js 14 App Router + Tailwind)      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Spring Boot REST API (Port 8080)           │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ AuthController│  │PatientCtrl  │  │ DoctorCtrl    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│  ┌──────▼─────────────────▼──────────────────▼────────┐  │
│  │              Service Layer                          │  │
│  │  AuthService · PatientService · DoctorService       │  │
│  │  ReceptionistService · AppointmentSchedulingFacade  │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                            │
│  ┌──────────────────────────▼──────────────────────────┐  │
│  │         SupabaseClient (Singleton JDBC)              │  │
│  └──────────────────────────┬──────────────────────────┘  │
└─────────────────────────────┼───────────────────────────┘
                              │ JDBC / PostgreSQL
                              ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                 │
│  patient · doctor · receptionist · scheduled_appointments│
│  requested_appointment · appointment_summary · medical_history│
└─────────────────────────────────────────────────────────┘
```

The backend follows an **MVC** structure:
- **Model** — POJOs and enums in `com.medica.model`
- **Controller** — REST endpoints in `com.medica.api`
- **Service** — Business logic in `com.medica.service`

---

## Design Patterns

Medica explicitly implements five Gang-of-Four design patterns:

### 1. Singleton — `SupabaseClient`
A single JDBC connection instance is shared across the entire application. Thread-safe via `synchronized`.

```java
SupabaseClient.getInstance().getConnection();
```

### 2. Strategy — `AuthStrategy`
Authentication is role-based. Each role has its own concrete strategy that queries a different table and verifies the BCrypt hash independently. New roles can be added without modifying existing code (Open/Closed Principle).

```
AuthStrategy (interface)
├── PatientAuthStrategy      → queries patient table
├── DoctorAuthStrategy       → queries doctor table
└── ReceptionistAuthStrategy → queries receptionist table
```

`AuthService` tries each strategy in sequence: Patient → Doctor → Receptionist.

### 3. Facade — `AppointmentSchedulingFacade`
Hides the complexity of scheduling behind a single method. Internally orchestrates:
1. Date validation (no past dates)
2. Time validation (end > start)
3. Conflict detection (3-case overlap algorithm)
4. Appointment ID generation (`A001`, `A002`, …)
5. Insert into `scheduled_appointments`
6. Delete from `requested_appointment`

```java
schedulingFacade.scheduleAppointment(patientId, doctorId, date, startTime, endTime);
```

### 4. Observer — `ToastManager`
Used in the console application. `ConsoleUI` implements `Observer` and subscribes to `ToastManager`. When any service calls `ToastManager.showToast(...)`, all subscribers are notified and print the message to the terminal.

Mirrors the `ToastContext` in the React frontend, where components subscribe via `useToast()`.

### 5. Template Method — `DoctorService.completeAppointment()`
Completing an appointment always follows a fixed three-step sequence:
1. Update `scheduled_appointments` status → `Completed`
2. Insert into `appointment_summary`
3. Insert into `medical_history`

---

## Project Structure

```
medica/
├── src/main/java/com/medica/
│   ├── MedicaApp.java                  # Console app entry point
│   ├── MedicaApiApp.java               # Spring Boot API entry point
│   ├── api/
│   │   ├── AuthController.java         # POST /api/auth/login, /register
│   │   ├── PatientController.java      # GET/POST /api/patient/**
│   │   ├── DoctorController.java       # GET/POST /api/doctor/**
│   │   ├── ReceptionistController.java # GET/POST /api/receptionist/**
│   │   └── CorsConfig.java             # CORS configuration
│   ├── auth/
│   │   ├── AuthService.java            # Strategy orchestrator
│   │   ├── AuthStrategy.java           # Strategy interface
│   │   ├── PatientAuthStrategy.java
│   │   ├── DoctorAuthStrategy.java
│   │   ├── ReceptionistAuthStrategy.java
│   │   └── RegistrationService.java    # Patient registration + validation
│   ├── db/
│   │   ├── DatabaseConfig.java         # Env vars → config.properties fallback
│   │   └── SupabaseClient.java         # Singleton JDBC connection
│   ├── model/
│   │   ├── Patient.java
│   │   ├── Doctor.java
│   │   ├── Receptionist.java
│   │   ├── AuthUser.java
│   │   ├── AuthSession.java
│   │   ├── ScheduledAppointment.java
│   │   ├── RequestedAppointment.java
│   │   ├── AppointmentSummary.java
│   │   ├── MedicalHistory.java
│   │   ├── UserRole.java               # Enum: PATIENT, DOCTOR, RECEPTIONIST
│   │   ├── AppointmentStatus.java      # Enum: SCHEDULED, COMPLETED, CANCELLED
│   │   └── ConditionType.java          # Enum: ACUTE, CHRONIC, PREVENTIVE
│   ├── service/
│   │   ├── PatientService.java
│   │   ├── DoctorService.java
│   │   ├── ReceptionistService.java
│   │   └── AppointmentSchedulingFacade.java
│   ├── observer/
│   │   ├── Observer.java               # Observer interface
│   │   ├── ToastManager.java           # Subject (Observable)
│   │   └── ToastType.java              # Enum: SUCCESS, ERROR, INFO
│   └── ui/                             # Console app UI (CLI only)
│       ├── ConsoleUI.java
│       ├── LoginUI.java
│       ├── PatientMenu.java
│       ├── DoctorMenu.java
│       └── ReceptionistMenu.java
│
├── src/main/resources/
│   └── application.properties          # Spring Boot config
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout + ToastProvider
│   │   ├── page.tsx                    # Root redirect (→ role dashboard or /login)
│   │   ├── globals.css                 # Base styles, animations, utility classes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── patient/
│   │   │   ├── layout.tsx              # Patient sidebar + auth guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── request-appointment/page.tsx
│   │   │   ├── appointments/page.tsx
│   │   │   └── medical-history/page.tsx
│   │   ├── doctor/
│   │   │   ├── layout.tsx              # Doctor sidebar + auth guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── appointments/page.tsx
│   │   │   ├── patients/page.tsx
│   │   │   └── patients/[pId]/page.tsx
│   │   └── receptionist/
│   │       ├── layout.tsx              # Receptionist sidebar + auth guard
│   │       ├── dashboard/page.tsx
│   │       ├── requests/page.tsx
│   │       └── appointments/page.tsx
│   ├── components/ui/
│   │   ├── Modal.tsx                   # Reusable modal (Escape + backdrop close)
│   │   ├── PageWrapper.tsx             # Page transition wrapper
│   │   └── Skeleton.tsx                # Skeleton loading components
│   ├── context/
│   │   └── ToastContext.tsx            # Observer-pattern toast notifications
│   └── lib/
│       ├── api.ts                      # Fetch wrapper
│       └── auth.ts                     # Session management (localStorage + cookie)
│
├── lib/
│   ├── postgresql-42.7.3.jar           # JDBC driver (for console app)
│   └── jbcrypt-0.4.jar                 # BCrypt (for console app)
│
├── Dockerfile                          # Multi-stage Docker build
├── pom.xml                             # Maven build config
├── config.properties.example          # Local DB config template
├── run.sh                              # Linux/Mac console app launcher
├── run.bat                             # Windows console app launcher
└── render.yaml                         # Render deployment config
```

---

## Database Schema

All passwords are stored as **BCrypt hashes** (10 rounds).

```sql
-- Users
CREATE TABLE patient (
    p_id        VARCHAR PRIMARY KEY,   -- P001, P002, ...
    name        VARCHAR NOT NULL,
    age         INTEGER NOT NULL,
    blood_group VARCHAR NOT NULL,
    gender      VARCHAR NOT NULL,
    email       VARCHAR UNIQUE NOT NULL,
    phone       VARCHAR NOT NULL,
    password    VARCHAR NOT NULL       -- bcrypt hash
);

CREATE TABLE doctor (
    d_id        VARCHAR PRIMARY KEY,   -- D001, D002, ...
    name        VARCHAR NOT NULL,
    email       VARCHAR UNIQUE NOT NULL,
    password    VARCHAR NOT NULL,
    department  VARCHAR NOT NULL,
    phone       VARCHAR NOT NULL
);

CREATE TABLE receptionist (
    r_id        VARCHAR PRIMARY KEY,   -- R001, R002, ...
    name        VARCHAR NOT NULL,
    email       VARCHAR UNIQUE NOT NULL,
    password    VARCHAR NOT NULL,
    phone       VARCHAR NOT NULL
);

-- Appointments
CREATE TABLE requested_appointment (
    p_id VARCHAR REFERENCES patient(p_id),
    d_id VARCHAR REFERENCES doctor(d_id),
    PRIMARY KEY (p_id, d_id)
);

CREATE TABLE scheduled_appointments (
    a_id       VARCHAR PRIMARY KEY,    -- A001, A002, ...
    p_id       VARCHAR REFERENCES patient(p_id),
    d_id       VARCHAR REFERENCES doctor(d_id),
    date       DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    status     VARCHAR NOT NULL        -- Scheduled | Completed | Cancelled
);

CREATE TABLE appointment_summary (
    a_id         VARCHAR PRIMARY KEY REFERENCES scheduled_appointments(a_id),
    symptoms     TEXT NOT NULL,
    diagnosis    TEXT NOT NULL,
    prescription TEXT NOT NULL
);

-- Medical Records
CREATE TABLE medical_history (
    p_id             VARCHAR REFERENCES patient(p_id),
    d_id             VARCHAR REFERENCES doctor(d_id),
    date             DATE NOT NULL,
    health_condition VARCHAR NOT NULL,
    treatment        VARCHAR NOT NULL,
    type             VARCHAR NOT NULL   -- Acute | Chronic | Preventive
);
```

### Entity Relationships

```
patient ──────────────────────────────── doctor
   │  (many-to-many via requested_appointment)  │
   │  (many-to-many via scheduled_appointments) │
   │  (many-to-many via medical_history)        │
   └────────────────────────────────────────────┘

scheduled_appointments ──── appointment_summary (1:1)
patient + doctor ──────────── medical_history (many)
```

---

## API Reference

Base URL: `http://localhost:8080` (local) or your Render URL (production)

### Auth — `/api/auth`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/auth/ping` | Keep-alive (wakes Render) | — |
| `POST` | `/api/auth/login` | Login for all roles | `{ email, password }` |
| `POST` | `/api/auth/register` | Register a new patient | `{ name, age, bloodGroup, gender, email, phone, password, confirmPassword }` |

**Login response:**
```json
{ "role": "patient", "id": "P001", "name": "John Doe", "email": "john@example.com" }
```

---

### Patient — `/api/patient`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patient/{id}/dashboard` | Stats + upcoming appointments + pending requests |
| `GET` | `/api/patient/{id}/appointments` | All appointments with doctor details |
| `GET` | `/api/patient/appointments/{appointmentId}/summary` | Completed appointment summary |
| `GET` | `/api/patient/doctors` | All doctors list |
| `GET` | `/api/patient/{id}/request-status/{doctorId}` | Returns `"idle"`, `"requested"`, or `"scheduled"` |
| `POST` | `/api/patient/{id}/request/{doctorId}` | Send appointment request |
| `GET` | `/api/patient/{id}/medical-history` | Medical history (optional `?search=` filter) |

---

### Doctor — `/api/doctor`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctor/{id}/dashboard` | Today's count + completed + unique patients + today's schedule |
| `GET` | `/api/doctor/{id}/appointments` | All appointments with patient details |
| `POST` | `/api/doctor/{id}/appointments/{appointmentId}/complete` | Complete appointment (3-table write) |
| `GET` | `/api/doctor/{id}/patients` | Unique patients treated by this doctor |
| `GET` | `/api/doctor/{id}/patients/{patientId}` | Patient detail + medical history (access-controlled) |

**Complete appointment body:**
```json
{
  "patientId": "P001",
  "date": "2026-04-23",
  "symptoms": "...",
  "diagnosis": "...",
  "prescription": "...",
  "healthCondition": "Hypertension",
  "treatment": "...",
  "type": "Chronic"
}
```

---

### Receptionist — `/api/receptionist`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/receptionist/dashboard` | Pending requests + today's count + week completed |
| `GET` | `/api/receptionist/requests` | All pending appointment requests |
| `POST` | `/api/receptionist/requests/schedule` | Schedule an appointment |
| `GET` | `/api/receptionist/appointments` | All appointments (optional `?status=` and `?date=` filters) |
| `POST` | `/api/receptionist/appointments/{id}/cancel` | Cancel a scheduled appointment |

**Schedule appointment body:**
```json
{
  "patientId": "P001",
  "doctorId": "D001",
  "date": "2026-04-25",
  "startTime": "09:00",
  "endTime": "09:30"
}
```

---

## Frontend Pages

### Public
| Route | Description |
|---|---|
| `/` | Redirects to role dashboard if session exists, otherwise `/login` |
| `/login` | Email + password login. Pings backend on load to wake Render. |
| `/register` | Patient self-registration form |

### Patient (`/patient/*`)
| Route | Description |
|---|---|
| `/patient/dashboard` | Stats cards + upcoming appointments + pending requests |
| `/patient/request-appointment` | Doctor cards with live request status (idle / requested / scheduled) |
| `/patient/appointments` | Appointment table with "View Summary" modal for completed ones |
| `/patient/medical-history` | Full history table with debounced search (300ms) |

### Doctor (`/doctor/*`)
| Route | Description |
|---|---|
| `/doctor/dashboard` | Stats + today's schedule list |
| `/doctor/appointments` | All appointments with "Complete" modal (5-field form) |
| `/doctor/patients` | Unique treated patients table |
| `/doctor/patients/[pId]` | Patient profile + medical history from this doctor's consultations |

### Receptionist (`/receptionist/*`)
| Route | Description |
|---|---|
| `/receptionist/dashboard` | Stats + recent requests list |
| `/receptionist/requests` | Pending requests table with "Schedule" modal |
| `/receptionist/appointments` | All appointments with status/date filters + cancel confirm modal |

---

## Authentication

### Flow

```
User submits email + password
        │
        ▼
AuthService.loginUser()
        │
        ├── PatientAuthStrategy.authenticate()    → queries patient table
        ├── DoctorAuthStrategy.authenticate()     → queries doctor table
        └── ReceptionistAuthStrategy.authenticate() → queries receptionist table
                │
                ▼ (first match wins)
        BCrypt.checkpw(password, hash)
                │
                ▼
        AuthSession { role, id, name, email }
```

### Session Storage (Frontend)

Sessions are stored in two places for different purposes:

| Storage | Key | Purpose |
|---|---|---|
| `localStorage` | `medica_session` | Full session JSON (id, name, email, role) |
| Cookie | `medica_role` | Role-based middleware routing |

The cookie expires in 24 hours (`max-age=86400`). Each role layout (`patient/layout.tsx`, `doctor/layout.tsx`, `receptionist/layout.tsx`) acts as an auth guard — it reads the session on mount and redirects to `/login` if the role doesn't match.

### Registration

Only **patients** can self-register. Doctors and receptionists are pre-created in the database.

Registration validation (both frontend and backend):
- Name: required
- Age: positive integer
- Blood group: one of `A+, A-, B+, B-, O+, O-, AB+, AB-`
- Gender: `Male`, `Female`, or `Other`
- Email: valid format, unique across all three role tables
- Phone: exactly 10 digits
- Password: minimum 8 characters
- Confirm password: must match

Patient IDs are auto-generated: `P001`, `P002`, `P003`, …

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- A Supabase project with the schema above applied

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/medica.git
cd medica
```

### 2. Configure the database

```bash
cp config.properties.example config.properties
```

Edit `config.properties`:
```properties
db.url=jdbc:postgresql://your-project-ref.supabase.co:5432/postgres
db.user=postgres
db.password=your_supabase_db_password
```

### 3. Run the Spring Boot API

```bash
mvn clean package -DskipTests
java -jar target/medica-1.0.jar
```

Or with Maven directly:
```bash
mvn spring-boot:run
```

The API starts on **port 8080**.

### 4. Run the frontend

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**.

---

### Running the Console App (optional)

The original CLI application can be run without Maven or Spring Boot.

**Linux / macOS:**
```bash
./run.sh
```

**Windows:**
```bat
run.bat
```

This compiles the Java sources directly using `javac` and runs `MedicaApp` with the JARs in `lib/`.

---

## Configuration

### Backend — `config.properties` (local)

```properties
db.url=jdbc:postgresql://<host>:5432/postgres
db.user=postgres
db.password=<password>
```

### Backend — Environment Variables (production)

| Variable | Description |
|---|---|
| `DB_URL` | Full JDBC connection URL |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `CORS_ORIGIN` | Allowed frontend origin (e.g. `https://medica.vercel.app`) |
| `PORT` | Server port (defaults to `8080`) |

Environment variables take priority over `config.properties`.

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

In production, set this to your Render backend URL.

---

## Deployment

### Backend (Render)

The `Dockerfile` uses a two-stage build:

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY lib ./lib
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/medica-1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Set the environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGIN`) in the Render dashboard.

The `/api/auth/ping` endpoint exists specifically to keep the Render free-tier instance awake. The login page pings it on load and shows a "Waking up server…" banner while waiting.

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

Set `NEXT_PUBLIC_API_URL` to your Render backend URL in the Vercel project settings.

---

## Role Capabilities

### Patient
- Register a new account
- Log in and view a personal dashboard (upcoming appointments, pending requests, total visits)
- Browse all doctors and send appointment requests
- Track request status per doctor: `idle` → `requested` → `scheduled`
- View all appointments with status badges (Scheduled / Completed / Cancelled)
- View appointment summaries (symptoms, diagnosis, prescription) for completed visits
- Browse full medical history with debounced search by health condition

### Doctor
- Log in and view today's schedule with patient details (name, age, blood group)
- View all appointments across all time
- Complete a scheduled appointment by filling in: symptoms, diagnosis, prescription, health condition, treatment, and condition type — atomically writes to three tables
- View a list of all unique patients treated
- Access a patient's full profile and medical history (restricted to patients the doctor has treated)

### Receptionist
- Log in and view a dashboard with pending requests, today's appointment count, and weekly completions
- View all pending appointment requests with patient and doctor details
- Schedule an appointment from a request — with automatic time conflict detection and appointment ID generation
- View all appointments with optional filters by status and date
- Cancel any scheduled appointment with a confirmation step
