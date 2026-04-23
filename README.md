# Medica — Medical Appointment Management System

A Java console application for managing medical appointments across three roles: Patient, Doctor, and Receptionist.

---

## Prerequisites

- Java 17+
- Maven

---

## Setup

**1. Configure the database**

Copy the example config and fill in your Supabase PostgreSQL credentials:

```bash
cp config.properties.example config.properties
```

Edit `config.properties`:
```properties
db.url=jdbc:postgresql://db.your-project-ref.supabase.co:5432/postgres
db.user=postgres
db.password=your_database_password
```

**2. Set up the database schema**

Run `database-setup.sql` in your Supabase SQL Editor to create all tables and insert sample data.

---

## Run

**Windows:**
```bat
run.bat
```

**Linux / Mac:**
```bash
./run.sh
```

That's it. One command compiles and launches the entire application. No Maven required.

---

## Optional: run with Maven (if installed)

```bash
mvn compile exec:java
```

---

## Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Doctor | sarah.johnson@medica.com | password123 |
| Receptionist | alice.williams@medica.com | password123 |
| Patient | Register through the app | — |

---

## Project Structure

```
src/main/java/com/medica/
├── MedicaApp.java          # Entry point
├── auth/                   # Strategy pattern — multi-role login
├── db/                     # Singleton — database connection
├── model/                  # POJOs — entities and enums
├── observer/               # Observer pattern — toast notifications
├── service/                # Business logic (Facade, Template Method)
└── ui/                     # Console menus (MVC View layer)
lib/                        # JDBC + jBCrypt JARs
config.properties.example   # Database config template
database-setup.sql          # Schema + sample data
pom.xml                     # Maven build
```

---

## Design Patterns

| Pattern | Location |
|---------|----------|
| Singleton | `db/SupabaseClient.java` |
| Strategy | `auth/AuthStrategy.java` + implementations |
| Observer | `observer/ToastManager.java` |
| Facade | `service/AppointmentSchedulingFacade.java` |
| Template Method | `service/DoctorService.completeAppointment()` |
| MVC | Overall package structure |

---

*UE23CS352B — Object Oriented Analysis & Design | PES University, Section K*
