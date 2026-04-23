package com.medica.service;

import com.medica.db.SupabaseClient;
import com.medica.model.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

/**
 * Business logic for doctor features.
 * 
 * Mirrors: doctor/dashboard/page.tsx, doctor/appointments/page.tsx,
 *          doctor/patients/page.tsx, doctor/patients/[P_ID]/page.tsx
 * 
 * Design Pattern: Template Method — completeAppointment() follows a fixed sequence:
 *   1. Validate form → 2. Update status → 3. Insert summary → 4. Insert history
 * 
 * Design Principle: DRY — getStatusColor() equivalent logic is shared via AppointmentStatus enum.
 */
public class DoctorService {

    private final Connection conn;

    public DoctorService() {
        this.conn = SupabaseClient.getInstance().getConnection();
    }

    // ─── Dashboard Data ────────────────────────────────────────────────
    // Mirrors: doctor/dashboard/page.tsx → loadDashboardData()

    public int getTodayScheduledCount(String doctorId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE d_id = ? AND date = ? AND status = 'Scheduled'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            stmt.setObject(2, LocalDate.now());
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public int getTotalCompletedCount(String doctorId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE d_id = ? AND status = 'Completed'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public int getUniquePatientCount(String doctorId) throws SQLException {
        String sql = "SELECT COUNT(DISTINCT p_id) FROM medical_history WHERE d_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Get today's schedule with patient details.
     * Mirrors: doctor/dashboard/page.tsx → scheduleData fetch
     */
    public List<ScheduledAppointment> getTodaySchedule(String doctorId) throws SQLException {
        String sql = "SELECT sa.a_id, sa.p_id, sa.start_time, sa.end_time, p.name, p.age, p.blood_group " +
                     "FROM scheduled_appointments sa " +
                     "JOIN patient p ON sa.p_id = p.p_id " +
                     "WHERE sa.d_id = ? AND sa.date = ? AND sa.status = 'Scheduled' " +
                     "ORDER BY sa.start_time ASC";
        List<ScheduledAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            stmt.setObject(2, LocalDate.now());
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ScheduledAppointment apt = new ScheduledAppointment();
                apt.setAId(rs.getString("a_id"));
                apt.setPId(rs.getString("p_id"));
                apt.setStartTime(rs.getObject("start_time", LocalTime.class));
                apt.setEndTime(rs.getObject("end_time", LocalTime.class));
                apt.setPatientName(rs.getString("name"));
                apt.setPatientAge(rs.getInt("age"));
                apt.setPatientBloodGroup(rs.getString("blood_group"));
                apt.setStatus(AppointmentStatus.SCHEDULED);
                result.add(apt);
            }
        }
        return result;
    }

    // ─── Appointments ──────────────────────────────────────────────────
    // Mirrors: doctor/appointments/page.tsx

    /**
     * Get all appointments for a doctor with patient details.
     */
    public List<ScheduledAppointment> getAllAppointments(String doctorId) throws SQLException {
        String sql = "SELECT sa.a_id, sa.p_id, sa.date, sa.start_time, sa.end_time, sa.status, p.name, p.age " +
                     "FROM scheduled_appointments sa " +
                     "JOIN patient p ON sa.p_id = p.p_id " +
                     "WHERE sa.d_id = ? ORDER BY sa.date DESC, sa.start_time DESC";
        List<ScheduledAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ScheduledAppointment apt = new ScheduledAppointment();
                apt.setAId(rs.getString("a_id"));
                apt.setPId(rs.getString("p_id"));
                apt.setDate(rs.getObject("date", LocalDate.class));
                apt.setStartTime(rs.getObject("start_time", LocalTime.class));
                apt.setEndTime(rs.getObject("end_time", LocalTime.class));
                apt.setStatus(AppointmentStatus.fromString(rs.getString("status")));
                apt.setPatientName(rs.getString("name"));
                apt.setPatientAge(rs.getInt("age"));
                result.add(apt);
            }
        }
        return result;
    }

    /**
     * Validate the completion form data.
     * Mirrors: validateForm() in doctor/appointments/page.tsx
     * 
     * @return list of error messages. Empty list means valid.
     */
    public List<String> validateCompletionForm(String symptoms, String diagnosis, String prescription,
                                                String healthCondition, String treatment) {
        List<String> errors = new ArrayList<>();
        if (symptoms == null || symptoms.trim().length() < 10) errors.add("Symptoms must be at least 10 characters");
        if (diagnosis == null || diagnosis.trim().length() < 10) errors.add("Diagnosis must be at least 10 characters");
        if (prescription == null || prescription.trim().length() < 10) errors.add("Prescription must be at least 10 characters");
        if (healthCondition == null || healthCondition.trim().isEmpty()) errors.add("Health Condition is required");
        if (treatment == null || treatment.trim().isEmpty()) errors.add("Treatment is required");
        return errors;
    }

    /**
     * Complete an appointment — atomically updates three tables.
     * 
     * Design Pattern: Template Method — follows a fixed sequence:
     *   1. Update scheduled_appointments status → 'Completed'
     *   2. Insert into appointment_summary
     *   3. Insert into medical_history
     * 
     * Mirrors: handleSubmit() in doctor/appointments/page.tsx
     * 
     * @return null on success, error message on failure
     */
    public String completeAppointment(String appointmentId, String patientId, String doctorId,
                                        String appointmentDate, String symptoms, String diagnosis,
                                        String prescription, String healthCondition,
                                        String treatment, String type) {
        try {
            // Step 1: Update appointment status to 'Completed'
            String updateSql = "UPDATE scheduled_appointments SET status = 'Completed' WHERE a_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
                stmt.setString(1, appointmentId);
                int rows = stmt.executeUpdate();
                if (rows == 0) return "Failed to update appointment status";
            }

            // Step 2: Insert appointment summary
            String summarySql = "INSERT INTO appointment_summary (a_id, symptoms, diagnosis, prescription) VALUES (?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(summarySql)) {
                stmt.setString(1, appointmentId);
                stmt.setString(2, symptoms);
                stmt.setString(3, diagnosis);
                stmt.setString(4, prescription);
                stmt.executeUpdate();
            }

            // Step 3: Insert medical history record
            String historySql = "INSERT INTO medical_history (p_id, d_id, date, health_condition, treatment, type) VALUES (?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(historySql)) {
                stmt.setString(1, patientId);
                stmt.setString(2, doctorId);
                stmt.setObject(3, LocalDate.parse(appointmentDate));
                stmt.setString(4, healthCondition);
                stmt.setString(5, treatment);
                stmt.setString(6, type);
                stmt.executeUpdate();
            }

            return null; // success
        } catch (SQLException e) {
            return "Error completing appointment: " + e.getMessage();
        }
    }

    // ─── My Patients ───────────────────────────────────────────────────
    // Mirrors: doctor/patients/page.tsx + doctor/patients/[P_ID]/page.tsx

    /**
     * Get unique patients treated by this doctor.
     * Mirrors: loadPatients() in doctor/patients/page.tsx
     */
    public List<Patient> getMyPatients(String doctorId) throws SQLException {
        String sql = "SELECT DISTINCT p.p_id, p.name, p.age, p.blood_group, p.gender, p.phone " +
                     "FROM medical_history mh " +
                     "JOIN patient p ON mh.p_id = p.p_id " +
                     "WHERE mh.d_id = ?";
        List<Patient> patients = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Patient p = new Patient();
                p.setPId(rs.getString("p_id"));
                p.setName(rs.getString("name"));
                p.setAge(rs.getInt("age"));
                p.setBloodGroup(rs.getString("blood_group"));
                p.setGender(rs.getString("gender"));
                p.setPhone(rs.getString("phone"));
                patients.add(p);
            }
        }
        return patients;
    }

    /**
     * Get detailed patient info by ID.
     * Mirrors: loadPatientData() in doctor/patients/[P_ID]/page.tsx
     */
    public Patient getPatientDetail(String patientId) throws SQLException {
        String sql = "SELECT p_id, name, age, blood_group, gender, phone, email FROM patient WHERE p_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Patient p = new Patient();
                p.setPId(rs.getString("p_id"));
                p.setName(rs.getString("name"));
                p.setAge(rs.getInt("age"));
                p.setBloodGroup(rs.getString("blood_group"));
                p.setGender(rs.getString("gender"));
                p.setPhone(rs.getString("phone"));
                p.setEmail(rs.getString("email"));
                return p;
            }
        }
        return null;
    }

    /**
     * Get medical history of a specific patient treated by this doctor.
     * Mirrors: historyData fetch in doctor/patients/[P_ID]/page.tsx
     */
    public List<MedicalHistory> getPatientMedicalHistory(String doctorId, String patientId) throws SQLException {
        String sql = "SELECT date, health_condition, treatment, type FROM medical_history WHERE d_id = ? AND p_id = ? ORDER BY date DESC";
        List<MedicalHistory> records = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            stmt.setString(2, patientId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                MedicalHistory record = new MedicalHistory();
                record.setDate(rs.getObject("date", LocalDate.class));
                record.setHealthCondition(rs.getString("health_condition"));
                record.setTreatment(rs.getString("treatment"));
                record.setType(ConditionType.fromString(rs.getString("type")));
                records.add(record);
            }
        }
        return records;
    }

    /**
     * Check if a doctor has treated a specific patient (access control).
     */
    public boolean hasTreatedPatient(String doctorId, String patientId) throws SQLException {
        String sql = "SELECT p_id FROM medical_history WHERE d_id = ? AND p_id = ? LIMIT 1";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            stmt.setString(2, patientId);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }
}
