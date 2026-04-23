package com.medica.service;

import com.medica.db.SupabaseClient;
import com.medica.model.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for patient features.
 * 
 * Mirrors: patient/dashboard/page.tsx, patient/appointments/page.tsx,
 *          patient/request-appointment/page.tsx, patient/medical-history/page.tsx
 * 
 * Design Principle: Single Responsibility — handles only patient-related operations.
 */
public class PatientService {

    private final Connection conn;

    public PatientService() {
        this.conn = SupabaseClient.getInstance().getConnection();
    }

    // ─── Dashboard Data ────────────────────────────────────────────────
    // Mirrors: patient/dashboard/page.tsx → loadDashboardData()

    /**
     * Get count of upcoming scheduled appointments for a patient.
     */
    public int getUpcomingCount(String patientId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE p_id = ? AND status = 'Scheduled' AND date >= ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            stmt.setObject(2, LocalDate.now());
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Get count of pending appointment requests.
     */
    public int getPendingRequestCount(String patientId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM requested_appointment WHERE p_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Get total completed visits count.
     */
    public int getCompletedCount(String patientId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE p_id = ? AND status = 'Completed'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Get upcoming appointments with doctor details.
     * Mirrors: patient/dashboard/page.tsx → upcomingAppointments fetch
     */
    public List<ScheduledAppointment> getUpcomingAppointments(String patientId) throws SQLException {
        String sql = "SELECT sa.a_id, sa.date, sa.start_time, sa.end_time, sa.d_id, d.name, d.department " +
                     "FROM scheduled_appointments sa " +
                     "JOIN doctor d ON sa.d_id = d.d_id " +
                     "WHERE sa.p_id = ? AND sa.status = 'Scheduled' AND sa.date >= ? " +
                     "ORDER BY sa.date ASC, sa.start_time ASC LIMIT 5";
        List<ScheduledAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            stmt.setObject(2, LocalDate.now());
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ScheduledAppointment apt = new ScheduledAppointment();
                apt.setAId(rs.getString("a_id"));
                apt.setDate(rs.getObject("date", LocalDate.class));
                apt.setStartTime(rs.getObject("start_time", LocalTime.class));
                apt.setEndTime(rs.getObject("end_time", LocalTime.class));
                apt.setDId(rs.getString("d_id"));
                apt.setDoctorName(rs.getString("name"));
                apt.setDoctorDepartment(rs.getString("department"));
                apt.setStatus(AppointmentStatus.SCHEDULED);
                result.add(apt);
            }
        }
        return result;
    }

    /**
     * Get pending requests with doctor details.
     */
    public List<RequestedAppointment> getPendingRequests(String patientId) throws SQLException {
        String sql = "SELECT ra.d_id, d.name, d.department " +
                     "FROM requested_appointment ra " +
                     "JOIN doctor d ON ra.d_id = d.d_id " +
                     "WHERE ra.p_id = ?";
        List<RequestedAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                RequestedAppointment req = new RequestedAppointment();
                req.setPId(patientId);
                req.setDId(rs.getString("d_id"));
                req.setDoctorName(rs.getString("name"));
                req.setDoctorDepartment(rs.getString("department"));
                result.add(req);
            }
        }
        return result;
    }

    // ─── Appointments ──────────────────────────────────────────────────
    // Mirrors: patient/appointments/page.tsx → loadAppointments()

    /**
     * Get all appointments for a patient with doctor details.
     */
    public List<ScheduledAppointment> getAllAppointments(String patientId) throws SQLException {
        String sql = "SELECT sa.a_id, sa.date, sa.start_time, sa.end_time, sa.status, sa.d_id, d.name, d.department " +
                     "FROM scheduled_appointments sa " +
                     "JOIN doctor d ON sa.d_id = d.d_id " +
                     "WHERE sa.p_id = ? ORDER BY sa.date DESC, sa.start_time DESC";
        List<ScheduledAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ScheduledAppointment apt = new ScheduledAppointment();
                apt.setAId(rs.getString("a_id"));
                apt.setDate(rs.getObject("date", LocalDate.class));
                apt.setStartTime(rs.getObject("start_time", LocalTime.class));
                apt.setEndTime(rs.getObject("end_time", LocalTime.class));
                apt.setStatus(AppointmentStatus.fromString(rs.getString("status")));
                apt.setDId(rs.getString("d_id"));
                apt.setDoctorName(rs.getString("name"));
                apt.setDoctorDepartment(rs.getString("department"));
                result.add(apt);
            }
        }
        return result;
    }

    /**
     * Get the summary for a completed appointment.
     * Mirrors: patient/appointments/page.tsx → loadSummary()
     */
    public AppointmentSummary getAppointmentSummary(String appointmentId) throws SQLException {
        String sql = "SELECT symptoms, diagnosis, prescription FROM appointment_summary WHERE a_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, appointmentId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new AppointmentSummary(appointmentId, rs.getString("symptoms"),
                        rs.getString("diagnosis"), rs.getString("prescription"));
            }
        }
        return null;
    }

    // ─── Request Appointment ───────────────────────────────────────────
    // Mirrors: patient/request-appointment/page.tsx

    /**
     * Get all doctors with their details.
     * Mirrors: loadDoctors() in request-appointment/page.tsx
     */
    public List<Doctor> getAllDoctors() throws SQLException {
        String sql = "SELECT d_id, name, department, phone FROM doctor ORDER BY name ASC";
        List<Doctor> doctors = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Doctor doc = new Doctor();
                doc.setDId(rs.getString("d_id"));
                doc.setName(rs.getString("name"));
                doc.setDepartment(rs.getString("department"));
                doc.setPhone(rs.getString("phone"));
                doctors.add(doc);
            }
        }
        return doctors;
    }

    /**
     * Get the request status for a patient-doctor pair.
     * Returns: "idle", "requested", or "scheduled"
     * Mirrors: status tracking in loadDoctors() in request-appointment/page.tsx
     */
    public String getRequestStatus(String patientId, String doctorId) throws SQLException {
        // Check if already scheduled
        String scheduledSql = "SELECT a_id FROM scheduled_appointments WHERE p_id = ? AND d_id = ? AND status = 'Scheduled' LIMIT 1";
        try (PreparedStatement stmt = conn.prepareStatement(scheduledSql)) {
            stmt.setString(1, patientId);
            stmt.setString(2, doctorId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return "scheduled";
        }

        // Check if request exists
        String requestSql = "SELECT p_id FROM requested_appointment WHERE p_id = ? AND d_id = ? LIMIT 1";
        try (PreparedStatement stmt = conn.prepareStatement(requestSql)) {
            stmt.setString(1, patientId);
            stmt.setString(2, doctorId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return "requested";
        }

        return "idle";
    }

    /**
     * Send an appointment request to a doctor.
     * Mirrors: handleRequestAppointment() in request-appointment/page.tsx
     * 
     * @return null on success, error message on failure
     */
    public String requestAppointment(String patientId, String doctorId) {
        String sql = "INSERT INTO requested_appointment (p_id, d_id) VALUES (?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            stmt.setString(2, doctorId);
            stmt.executeUpdate();
            return null; // success
        } catch (SQLException e) {
            if (e.getSQLState() != null && e.getSQLState().equals("23505")) {
                return "Request already sent to this doctor";
            }
            return "Failed to send request: " + e.getMessage();
        }
    }

    // ─── Medical History ───────────────────────────────────────────────
    // Mirrors: patient/medical-history/page.tsx

    /**
     * Get full medical history for a patient with doctor details.
     * Mirrors: loadMedicalHistory() + search filtering by health condition
     * 
     * Observer Pattern: In the TS version, useEffect watches searchTerm.
     * Here, the search filtering is done in the UI layer.
     */
    public List<MedicalHistory> getMedicalHistory(String patientId) throws SQLException {
        String sql = "SELECT mh.date, mh.health_condition, mh.treatment, mh.type, mh.d_id, d.name, d.department " +
                     "FROM medical_history mh " +
                     "JOIN doctor d ON mh.d_id = d.d_id " +
                     "WHERE mh.p_id = ? ORDER BY mh.date DESC";
        List<MedicalHistory> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, patientId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                MedicalHistory record = new MedicalHistory();
                record.setPId(patientId);
                record.setDId(rs.getString("d_id"));
                record.setDate(rs.getObject("date", LocalDate.class));
                record.setHealthCondition(rs.getString("health_condition"));
                record.setTreatment(rs.getString("treatment"));
                record.setType(ConditionType.fromString(rs.getString("type")));
                record.setDoctorName(rs.getString("name"));
                record.setDoctorDepartment(rs.getString("department"));
                result.add(record);
            }
        }
        return result;
    }

    /**
     * Filter medical history records by health condition search term.
     * Mirrors: the useEffect observer in medical-history/page.tsx
     * 
     * Observer Pattern equivalent: useEffect watches searchTerm and reactively filters
     */
    public List<MedicalHistory> filterByCondition(List<MedicalHistory> records, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return records;
        }
        String term = searchTerm.toLowerCase();
        List<MedicalHistory> filtered = new ArrayList<>();
        for (MedicalHistory record : records) {
            if (record.getHealthCondition().toLowerCase().contains(term)) {
                filtered.add(record);
            }
        }
        return filtered;
    }
}
