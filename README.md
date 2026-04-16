# Medica — Medical Appointment Management System

---

## Course Details

| Field | Details |
|---|---|
| Course | UE23CS352B – Object Oriented Analysis & Design |
| Section | K |
| Faculty | Dr. Vanitha |
| Institution | PES University |
| Academic Year | 2023–24 |

---

## Team Members

| Name | SRN | Role Owned |
|---|---|---|
| Varun Rathod | PES2UG23CS679 | Patient Module (Appointment Requests, Medical History) |
| Vatsal Jain | PES2UG23CS681 | Authentication & Registration System |
| Vedanta Barman | PES2UG23CS681 | Doctor Module (Appointments, Patient Records) |
| Vrishabh S. Hiremath | PES2UG23CS709 | Receptionist Module (Request Management, Scheduling) |

---

## Problem Statement

Healthcare facilities face significant challenges in managing appointment workflows efficiently. Patients struggle to find and request appointments with the right doctors, receptionists spend excessive time manually coordinating schedules, and doctors lack a centralized view of their patient history. Medica solves this by providing a unified, role-based web application that digitizes the entire appointment lifecycle — from patient request to doctor consultation and medical record keeping.

---

## Project Overview

Medica is a full-stack web application built for the **Healthcare** domain. It supports three distinct user roles — **Patient**, **Doctor**, and **Receptionist** — each with their own dashboard, navigation, and feature set. The system manages the complete lifecycle of a medical appointment:

```
Patient requests appointment
        ↓
Receptionist reviews and schedules it (with conflict detection)
        ↓
Doctor views schedule, conducts appointment, records medical details
        ↓
Patient views appointment summary and updated medical history
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14.2.0 (App Router) |
| UI Library | React 18.2.0 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4.1 |
| Database | Supabase (PostgreSQL) |
| Auth | Custom session-based auth with bcryptjs |
| Icons | Lucide React |
| State Management | React Context API |

> Note: This project is implemented using Next.js (a JavaScript/TypeScript framework). The architecture, design patterns, and OOP principles described in this document are directly mapped to their Java equivalents as required by the course. The structural and behavioral patterns are identical regardless of language.

---

## Application Architecture — MVC Pattern

The project strictly follows the **Model-View-Controller (MVC)** architectural pattern:

### Model
Represents the data layer. All database entities are modeled as TypeScript interfaces that map directly to Supabase (PostgreSQL) tables.

```
lib/supabaseClient.ts     → Database connection (single Supabase client instance)
lib/auth.ts               → AuthSession, AuthUser models + business logic
```

Each page defines its own local data interfaces (e.g., `AppointmentWithPatient`, `MedicalHistoryRecord`, `RequestWithDetails`) that represent the shape of data fetched from the database — equivalent to Java POJOs/Entity classes.

### View
All UI rendering is handled by React components (`.tsx` files). Each page is a pure view that receives data from state and renders it. Views never directly access the database.

```
app/(auth)/login/page.tsx
app/patient/dashboard/page.tsx
app/doctor/appointments/page.tsx
app/receptionist/requests/page.tsx
components/ui/Modal.tsx
components/ui/Badge.tsx
... (all page and component files)
```

### Controller
The controller logic lives inside each page component's event handlers and data-loading functions. These functions receive user input, call the model (Supabase queries), and update the view state.

```typescript
// Example from receptionist/requests/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // 1. Validate input (Controller logic)
  // 2. Check time conflicts (Business logic)
  // 3. Insert into DB (Model interaction)
  // 4. Update local state (View update)
};
```

The layout files (`app/doctor/layout.tsx`, `app/patient/layout.tsx`, `app/receptionist/layout.tsx`) act as **Front Controllers** — they intercept every request to their respective route groups, validate the session, and redirect unauthorized users.

---

## Database Schema

### Tables

#### `patient`
| Column | Type | Description |
|---|---|---|
| p_id | VARCHAR (PK) | Auto-generated ID (P001, P002, ...) |
| name | TEXT | Full name |
| age | INTEGER | Age |
| blood_group | VARCHAR | Blood group (A+, B-, etc.) |
| gender | VARCHAR | Male / Female / Other |
| email | VARCHAR (UNIQUE) | Login email |
| phone | VARCHAR | 10-digit phone number |
| password | TEXT | bcrypt hashed password |

#### `doctor`
| Column | Type | Description |
|---|---|---|
| d_id | VARCHAR (PK) | Doctor ID (D001, D002, ...) |
| name | TEXT | Full name |
| email | VARCHAR (UNIQUE) | Login email |
| password | TEXT | bcrypt hashed password |
| department | VARCHAR | Medical department |
| phone | VARCHAR | Contact number |

#### `receptionist`
| Column | Type | Description |
|---|---|---|
| r_id | VARCHAR (PK) | Receptionist ID (R001, ...) |
| name | TEXT | Full name |
| email | VARCHAR (UNIQUE) | Login email |
| password | TEXT | bcrypt hashed password |
| phone | VARCHAR | Contact number |

#### `requested_appointment`
| Column | Type | Description |
|---|---|---|
| p_id | VARCHAR (FK → patient) | Patient who made the request |
| d_id | VARCHAR (FK → doctor) | Doctor being requested |

#### `scheduled_appointments`
| Column | Type | Description |
|---|---|---|
| a_id | VARCHAR (PK) | Appointment ID (A001, A002, ...) |
| p_id | VARCHAR (FK → patient) | Patient |
| d_id | VARCHAR (FK → doctor) | Doctor |
| date | DATE | Appointment date |
| start_time | TIME | Start time |
| end_time | TIME | End time |
| status | VARCHAR | Scheduled / Completed / Cancelled |

#### `appointment_summary`
| Column | Type | Description |
|---|---|---|
| a_id | VARCHAR (FK → scheduled_appointments) | Appointment reference |
| symptoms | TEXT | Patient symptoms |
| diagnosis | TEXT | Doctor's diagnosis |
| prescription | TEXT | Prescribed medication/treatment |

#### `medical_history`
| Column | Type | Description |
|---|---|---|
| p_id | VARCHAR (FK → patient) | Patient |
| d_id | VARCHAR (FK → doctor) | Treating doctor |
| date | DATE | Date of treatment |
| health_condition | TEXT | Condition name |
| treatment | TEXT | Treatment given |
| type | VARCHAR | Acute / Chronic / Preventive |

---

## Features

### Major Features (4 — one per team member)

#### 1. Patient Appointment Request System (Varun Rathod)
Patients can browse all available doctors filtered by department, view their contact details, and send appointment requests. The system tracks the status of each request per doctor (idle → requested → scheduled) and prevents duplicate requests. Real-time status updates are shown on the doctor cards.

**Route:** `/patient/request-appointment`

#### 2. Authentication & Registration System (Vatsal Jain)
A unified login page supports all three roles (patient, doctor, receptionist) using a single email/password form. The system queries each role's table sequentially and uses bcrypt to verify hashed passwords. New patients can self-register with full validation. Sessions are stored in localStorage and a cookie is set for role-based routing.

**Routes:** `/login`, `/register`

#### 3. Doctor Appointment Completion & Medical Records (Vedanta Barman)
Doctors can view their full appointment history, mark scheduled appointments as completed, and simultaneously record medical details (symptoms, diagnosis, prescription, health condition, treatment type). This atomically updates three tables: `scheduled_appointments`, `appointment_summary`, and `medical_history`.

**Routes:** `/doctor/appointments`, `/doctor/patients`, `/doctor/patients/[P_ID]`

#### 4. Receptionist Appointment Scheduling with Conflict Detection (Vrishabh S. Hiremath)
Receptionists manage the queue of pending appointment requests and schedule them by assigning a date and time slot. Before confirming, the system checks for time conflicts with the doctor's existing appointments. Scheduled appointments can also be cancelled. Full filtering by status and date is available.

**Routes:** `/receptionist/requests`, `/receptionist/scheduled`

---

### Minor Features (4 — one per team member)

#### 1. Patient Medical History View with Search (Varun Rathod)
Patients can view their complete medical history across all doctors, with the ability to search/filter records by health condition name. Records show date, treating doctor, department, condition, treatment, and type (Acute/Chronic/Preventive).

**Route:** `/patient/medical-history`

#### 2. Role-Based Dashboard with Live Statistics (Vatsal Jain)
Each role has a personalized dashboard showing real-time statistics fetched from the database. Patient dashboard shows upcoming appointments and pending requests. Doctor dashboard shows today's schedule with patient details. Receptionist dashboard shows pending requests, today's count, and weekly completions.

**Routes:** `/patient/dashboard`, `/doctor/dashboard`, `/receptionist/dashboard`

#### 3. Patient Appointment History with Summaries (Vedanta Barman)
Patients can view all their scheduled and completed appointments. Completed appointments show the full appointment summary (symptoms, diagnosis, prescription) recorded by the doctor. Status badges visually distinguish Scheduled, Completed, and Cancelled states.

**Route:** `/patient/appointments`

#### 4. Appointment Cancellation with Confirmation Dialog (Vrishabh S. Hiremath)
Receptionists can cancel any scheduled appointment. A confirmation dialog (`ConfirmDialog` component) prevents accidental cancellations. The UI updates optimistically — the status badge changes immediately without a full page reload.

**Route:** `/receptionist/scheduled`

---

## Individual Contributions

### Varun Rathod — PES2UG23CS679
**Major:** Patient Appointment Request System  
Implemented the doctor browsing page with department-based color-coded badges, per-doctor request status tracking (idle/requested/scheduled/loading), and the full request submission flow to the `requested_appointment` table. Handled duplicate request detection using Supabase's unique constraint error code `23505`.

**Minor:** Patient Medical History View  
Built the medical history table with real-time search filtering using React's `useEffect` to reactively filter records as the user types. Fetched and joined doctor details for each history record.

**Design Pattern:** Observer Pattern (via React `useEffect` watching `searchTerm` state)  
**Design Principle:** Single Responsibility Principle — the request page only handles requesting; viewing history is a separate page.

---

### Vatsal Jain — PES2UG23CS681
**Major:** Authentication & Registration System  
Implemented the multi-role login flow in `lib/auth.ts` that sequentially queries patient, doctor, and receptionist tables and uses `bcrypt.compare` for password verification. Built the patient registration form with full client-side validation (name, age, blood group, gender, email, phone, password strength, confirm password). Auto-generates patient IDs by querying the last ID and incrementing.

**Minor:** Role-Based Dashboards  
Built all three dashboards with personalized greetings (time-of-day aware), live stat cards, and data-rich content sections (today's schedule for doctors, upcoming appointments for patients, recent requests for receptionists).

**Design Pattern:** Strategy Pattern — `loginUser()` tries each role's authentication strategy in sequence  
**Design Principle:** Open/Closed Principle — new roles can be added to `loginUser()` without modifying existing role logic.

---

### Vedanta Barman — PES2UG23CS681
**Major:** Doctor Appointment Completion & Medical Records  
Implemented the appointment completion modal with a 6-field form (symptoms, diagnosis, prescription, health condition, treatment, type). On submission, atomically updates `scheduled_appointments` status, inserts into `appointment_summary`, and inserts into `medical_history`. Includes multi-field form validation with minimum character requirements.

**Minor:** Patient Appointment History with Summaries  
Built the patient-facing appointments page that fetches all appointments and their associated summaries. Implemented the expandable summary view so patients can read their diagnosis and prescription after a completed visit.

**Design Pattern:** Template Method Pattern — the appointment completion flow follows a fixed sequence of steps (validate → update status → insert summary → insert history)  
**Design Principle:** DRY (Don't Repeat Yourself) — `getStatusColor()` is a shared utility used across multiple pages.

---

### Vrishabh S. Hiremath — PES2UG23CS709
**Major:** Receptionist Appointment Scheduling  
Built the full scheduling workflow: viewing pending requests with patient/doctor details, opening a scheduling modal, validating date/time, running time-conflict detection against existing appointments, generating appointment IDs, inserting into `scheduled_appointments`, and deleting from `requested_appointment`. Implemented the overlap detection algorithm that checks all three overlap cases (start inside, end inside, fully contains).

**Minor:** Appointment Cancellation with Confirmation  
Implemented the cancel flow with the reusable `ConfirmDialog` component. Used optimistic UI updates — the local state is updated immediately on confirmation without waiting for a re-fetch.

**Design Pattern:** Facade Pattern — the scheduling modal presents a simple interface that hides the complexity of conflict detection, ID generation, and multi-table operations  
**Design Principle:** Separation of Concerns — conflict detection logic is isolated in `checkTimeConflict()`, separate from the form submission handler.

---

## Design Patterns Used

### 1. Singleton Pattern (Creational)
**File:** `lib/supabaseClient.ts`

The Supabase client is instantiated exactly once and exported as a module-level constant. Every file that imports `supabase` gets the same instance — this is the JavaScript module system's natural Singleton.

```typescript
// lib/supabaseClient.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// One instance, shared across the entire application
```

**Java Equivalent:**
```java
public class SupabaseClient {
    private static SupabaseClient instance;
    private SupabaseClient() {}
    public static SupabaseClient getInstance() {
        if (instance == null) instance = new SupabaseClient();
        return instance;
    }
}
```

---

### 2. Observer Pattern (Behavioral)
**File:** `context/ToastContext.tsx`, `app/patient/medical-history/page.tsx`

The `ToastContext` implements the Observer pattern. Components subscribe to the toast system via `useToast()`. When `showToast()` is called anywhere in the app, all subscribed components (the toast renderer) are notified and update.

The medical history search also uses this pattern — a `useEffect` observes `searchTerm` and reactively filters records whenever it changes.

```typescript
// Observer: useEffect watches searchTerm (the subject)
useEffect(() => {
    const filtered = records.filter(record =>
        record.health_condition.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
}, [searchTerm, records]); // Re-runs whenever searchTerm or records change
```

**Java Equivalent:**
```java
interface Observer { void update(String searchTerm); }
class MedicalHistoryView implements Observer {
    public void update(String searchTerm) { filterRecords(searchTerm); }
}
```

---

### 3. Strategy Pattern (Behavioral)
**File:** `lib/auth.ts`

The `loginUser()` function implements the Strategy pattern. It tries three different authentication strategies (patient, doctor, receptionist) at runtime. Each strategy is a self-contained block that queries a different table and verifies credentials independently.

```typescript
// Strategy 1: Patient authentication
const { data: patientData } = await supabase.from('patient')...
if (patientData) { const isValid = await bcrypt.compare(...); }

// Strategy 2: Doctor authentication
const { data: doctorData } = await supabase.from('doctor')...

// Strategy 3: Receptionist authentication
const { data: receptionistData } = await supabase.from('receptionist')...
```

**Java Equivalent:**
```java
interface AuthStrategy { AuthSession authenticate(String email, String password); }
class PatientAuthStrategy implements AuthStrategy { ... }
class DoctorAuthStrategy implements AuthStrategy { ... }
class ReceptionistAuthStrategy implements AuthStrategy { ... }
```

---

### 4. Facade Pattern (Structural)
**File:** `app/receptionist/requests/page.tsx`

The `handleSubmit()` function in the scheduling modal is a Facade. It presents a single, simple interface to the receptionist (fill form → click submit) while internally orchestrating: date validation, time validation, conflict detection, ID generation, database insert, database delete, and UI state update.

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    // Hides complexity behind a single submit action:
    validateDate();
    validateTime();
    await checkTimeConflict();     // Complex overlap algorithm
    const id = await generateId(); // ID generation logic
    await supabase.insert(...);    // DB write 1
    await supabase.delete(...);    // DB write 2
    updateLocalState();            // Optimistic UI
    showToast(...);
};
```

**Java Equivalent:**
```java
class AppointmentSchedulingFacade {
    public void scheduleAppointment(ScheduleRequest req) {
        validator.validateDate(req);
        conflictDetector.check(req);
        String id = idGenerator.generate();
        appointmentRepo.save(id, req);
        requestRepo.delete(req);
    }
}
```

---

## Design Principles Used

### 1. Single Responsibility Principle (SRP)
Every module has one reason to change:
- `lib/supabaseClient.ts` — only responsible for creating the DB connection
- `lib/auth.ts` — only responsible for authentication logic
- `context/ToastContext.tsx` — only responsible for notification management
- Each page component handles only its own feature's UI and data

### 2. Open/Closed Principle (OCP)
The `loginUser()` function in `lib/auth.ts` is open for extension (add a new role by appending a new block) but closed for modification (existing patient/doctor/receptionist logic is never touched when adding a new role). Similarly, the `Badge` component accepts a `variant` prop — new variants can be added without changing existing ones.

### 3. DRY — Don't Repeat Yourself
Utility functions are extracted and reused:
- `getStatusColor(status)` — used in both doctor appointments and receptionist scheduled pages
- `getTypeColor(type)` — reused for medical history type badges
- `formatDate(dateString)` — consistent date formatting across all pages
- `getInitials(name)` — avatar initials generation used in doctor and patient cards

### 4. Separation of Concerns (SoC)
The codebase cleanly separates:
- **Data access** → `lib/supabaseClient.ts`, `lib/auth.ts`
- **Business logic** → inside page-level handler functions (`checkTimeConflict`, `validateForm`, `generateAppointmentId`)
- **UI rendering** → React components and page JSX
- **Global state** → `context/ToastContext.tsx`
- **Routing/Auth guard** → layout files (`doctor/layout.tsx`, `patient/layout.tsx`, `receptionist/layout.tsx`)

---

## OOP Concepts Applied

### Encapsulation
Data and behavior are bundled together. The `AuthSession` interface encapsulates user identity (id, name, email) and role together. The `ToastContext` encapsulates the toast array and the `showToast` function — consumers only see `showToast`, not the internal state.

```typescript
// Encapsulated: consumers only call showToast(), internal state is hidden
const { showToast } = useToast();
showToast('Appointment scheduled', 'success');
```

### Abstraction
Complex operations are hidden behind simple interfaces:
- `loginUser(email, password)` abstracts away the three-table lookup and bcrypt comparison
- `supabase.from('table').select(...)` abstracts raw SQL
- The `Modal` component abstracts keyboard handling (Escape key), scroll locking, and backdrop click — callers just pass `isOpen` and `onClose`

### Polymorphism
The `Badge` component exhibits polymorphism — the same component renders differently based on the `variant` prop. The `getStatusColor()` function behaves differently for each status string, returning different CSS classes. React's component model itself is polymorphic — `children` props accept any valid React node.

```typescript
// Same component, different behavior based on variant
<Badge variant="scheduled" label="Scheduled" />
<Badge variant="completed" label="Completed" />
<Badge variant="cancelled" label="Cancelled" />
```

### Inheritance / Interface Implementation
TypeScript interfaces define contracts that all data objects must satisfy:

```typescript
interface AuthSession {
    role: UserRole;
    user: AuthUser;
}
// Every session object across the app must implement this shape
```

The `ToastContextType` interface defines the contract for the context — any provider must implement `showToast`. Layout components all follow the same structural contract: check session → validate role → render sidebar + children.

### Composition
Complex UI is built by composing smaller components:
- `RequestsPage` composes `Modal` + form fields + table rows
- `ScheduledAppointmentsPage` composes `ConfirmDialog` + filter controls + table
- Each layout composes `ToastProvider` + sidebar navigation + page content

---

## Application Flow

### Authentication Flow
```
User visits / → redirected to /login
User submits credentials → loginUser() queries patient/doctor/receptionist tables
Password verified with bcrypt → session stored in localStorage + cookie set
Router pushes to /{role}/dashboard
Layout component reads session on mount → validates role → renders or redirects
```

### Appointment Lifecycle
```
1. Patient → /patient/request-appointment
   → Selects doctor → INSERT into requested_appointment

2. Receptionist → /receptionist/requests
   → Views pending requests → Opens scheduling modal
   → Picks date/time → checkTimeConflict() runs
   → No conflict → INSERT into scheduled_appointments
   → DELETE from requested_appointment

3. Doctor → /doctor/appointments
   → Views scheduled appointments → Clicks "Complete"
   → Fills symptoms/diagnosis/prescription/condition/treatment/type
   → UPDATE scheduled_appointments status = 'Completed'
   → INSERT into appointment_summary
   → INSERT into medical_history

4. Patient → /patient/appointments
   → Views completed appointment → Reads summary

5. Patient → /patient/medical-history
   → Views full history across all doctors → Searches by condition
```

---

## Project Structure

```
medica-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Multi-role login
│   │   └── register/page.tsx       # Patient registration
│   ├── patient/
│   │   ├── layout.tsx              # Auth guard + sidebar (patient)
│   │   ├── dashboard/page.tsx      # Stats + upcoming appointments
│   │   ├── request-appointment/    # Browse doctors + send requests
│   │   ├── appointments/           # View all appointments + summaries
│   │   └── medical-history/        # Full history with search
│   ├── doctor/
│   │   ├── layout.tsx              # Auth guard + sidebar (doctor)
│   │   ├── dashboard/page.tsx      # Today's schedule + stats
│   │   ├── appointments/           # Complete appointments + record details
│   │   └── patients/               # Treated patients + [P_ID] detail view
│   ├── receptionist/
│   │   ├── layout.tsx              # Auth guard + sidebar (receptionist)
│   │   ├── dashboard/page.tsx      # Stats + recent requests
│   │   ├── requests/               # Schedule pending requests
│   │   └── scheduled/              # All appointments + cancel
│   ├── layout.tsx                  # Root layout (Inter font, metadata)
│   ├── page.tsx                    # Redirects to /login
│   ├── globals.css                 # Global styles + custom animations
│   ├── error.tsx                   # Global error boundary
│   └── not-found.tsx               # 404 page
├── components/
│   └── ui/
│       ├── Badge.tsx               # Status/type badge component
│       ├── ConfirmDialog.tsx        # Reusable confirmation modal
│       ├── EmptyState.tsx           # Empty list placeholder
│       ├── LoadingSpinner.tsx       # Spinner component
│       ├── Modal.tsx                # Generic modal with Escape + scroll lock
│       └── Skeleton.tsx             # Loading skeleton
├── context/
│   └── ToastContext.tsx            # Global toast notification system
├── lib/
│   ├── auth.ts                     # loginUser, getSession, clearSession
│   └── supabaseClient.ts           # Supabase client (Singleton)
├── .env.local                      # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
├── tailwind.config.ts              # Custom color palette + animations
├── next.config.mjs                 # Next.js config
└── package.json                    # Dependencies
```

---

## Setup & Running the Project

### Prerequisites
- Node.js 18+
- A Supabase project with the schema described above

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install & Run
```bash
npm install
npm run dev
```

Open `http://localhost:3000` — you will be redirected to `/login`.

---

## Required UML Diagrams (To Be Created)

> The following diagrams are required for submission and must be prepared separately.

| # | Diagram | Description |
|---|---|---|
| 1 | Use Case Diagram (1) | Actors: Patient, Doctor, Receptionist. Use cases: Login, Register, Request Appointment, Schedule Appointment, Complete Appointment, View Medical History, Cancel Appointment, View Dashboard |
| 2 | Class Diagram (1) | Classes: Patient, Doctor, Receptionist, Appointment, AppointmentSummary, MedicalHistory, AuthSession. Show attributes, methods, and relationships (associations, dependencies) |
| 3 | Activity Diagram — Appointment Request Flow | Patient browses doctors → selects doctor → sends request → receptionist receives → schedules → doctor completes |
| 4 | Activity Diagram — User Login Flow | User enters credentials → system queries tables → bcrypt verify → session stored → redirect to dashboard |
| 5 | Activity Diagram — Appointment Completion | Doctor opens appointment → fills form → validate → update status → insert summary → insert history |
| 6 | Activity Diagram — Appointment Cancellation | Receptionist views appointments → selects appointment → confirm dialog → update status to Cancelled |
| 7 | State Diagram — Appointment Status | States: Requested → Scheduled → Completed / Cancelled. Transitions triggered by receptionist scheduling, doctor completing, receptionist cancelling |
| 8 | State Diagram — User Session | States: Unauthenticated → Authenticated (Patient/Doctor/Receptionist) → Session Expired → Unauthenticated |
| 9 | State Diagram — Appointment Request | States: Idle → Requested → Scheduled (per doctor, from patient's perspective) |
| 10 | State Diagram — Doctor's Appointment | States: No Appointments → Has Scheduled → In Progress → Completed |

---

## GitHub Repository

`https://github.com/[your-username]/medica-app`

---

*© 2024 Medica — PES University, Section K, UE23CS352B*