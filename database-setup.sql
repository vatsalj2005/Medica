-- Medica Database Setup Script
-- Run this in your Supabase SQL Editor to create all tables

-- ============================================================
-- STEP 1: Create Tables
-- ============================================================

-- Patient table
CREATE TABLE IF NOT EXISTS patient (
    p_id VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password TEXT NOT NULL
);

-- Doctor table
CREATE TABLE IF NOT EXISTS doctor (
    d_id VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

-- Receptionist table
CREATE TABLE IF NOT EXISTS receptionist (
    r_id VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL
);

-- Requested appointments (pending requests)
CREATE TABLE IF NOT EXISTS requested_appointment (
    p_id VARCHAR(10) REFERENCES patient(p_id) ON DELETE CASCADE,
    d_id VARCHAR(10) REFERENCES doctor(d_id) ON DELETE CASCADE,
    PRIMARY KEY (p_id, d_id)
);

-- Scheduled appointments
CREATE TABLE IF NOT EXISTS scheduled_appointments (
    a_id VARCHAR(10) PRIMARY KEY,
    p_id VARCHAR(10) REFERENCES patient(p_id) ON DELETE CASCADE,
    d_id VARCHAR(10) REFERENCES doctor(d_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
);

-- Appointment summary (created when doctor completes appointment)
CREATE TABLE IF NOT EXISTS appointment_summary (
    a_id VARCHAR(10) PRIMARY KEY REFERENCES scheduled_appointments(a_id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL
);

-- Medical history (long-term patient records)
CREATE TABLE IF NOT EXISTS medical_history (
    p_id VARCHAR(10) REFERENCES patient(p_id) ON DELETE CASCADE,
    d_id VARCHAR(10) REFERENCES doctor(d_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    health_condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    PRIMARY KEY (p_id, d_id, date)
);

-- ============================================================
-- STEP 2: Insert Sample Data (Optional)
-- ============================================================

-- Sample Doctors
-- Password for all sample accounts: "password123"
-- Hashed with bcrypt (10 rounds): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO doctor (d_id, name, email, password, department, phone) VALUES
('D001', 'Dr. Sarah Johnson', 'sarah.johnson@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Cardiology', '555-0101'),
('D002', 'Dr. Michael Chen', 'michael.chen@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Neurology', '555-0102'),
('D003', 'Dr. Emily Davis', 'emily.davis@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Pediatrics', '555-0103'),
('D004', 'Dr. James Wilson', 'james.wilson@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Orthopedics', '555-0104'),
('D005', 'Dr. Lisa Anderson', 'lisa.anderson@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dermatology', '555-0105'),
('D006', 'Dr. Robert Martinez', 'robert.martinez@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Psychiatry', '555-0106')
ON CONFLICT (d_id) DO NOTHING;

-- Sample Receptionists
INSERT INTO receptionist (r_id, name, email, password, phone) VALUES
('R001', 'Alice Williams', 'alice.williams@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0201'),
('R002', 'Bob Thompson', 'bob.thompson@medica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0202')
ON CONFLICT (r_id) DO NOTHING;

-- ============================================================
-- STEP 3: Verify Setup
-- ============================================================

-- Check table counts
SELECT 'Doctors' as table_name, COUNT(*) as count FROM doctor
UNION ALL
SELECT 'Receptionists', COUNT(*) FROM receptionist
UNION ALL
SELECT 'Patients', COUNT(*) FROM patient;

-- ============================================================
-- NOTES
-- ============================================================
-- 1. All sample accounts use password: "password123"
-- 2. Patients can self-register through the application
-- 3. To add more doctors/receptionists, use the INSERT statements above
-- 4. The application will auto-generate IDs (P001, D007, R003, A001, etc.)
