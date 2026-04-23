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
 * Business logic for receptionist features.
 * 
 * Mirrors: receptionist/dashboard/page.tsx, receptionist/requests/page.tsx,
 *          receptionist/scheduled/page.tsx
 * 
 * Design Principle: Separation of Concerns — scheduling complexity is delegated
 * to AppointmentSchedulingFacade.
 */
public class ReceptionistService {

    private final Connection conn;

    public ReceptionistService() {
        this.conn = SupabaseClient.getInstance().getConnection();
    }

    // ─── Dashboard Data ────────────────────────────────────────────────
    // Mirrors: receptionist/dashboard/page.tsx → loadDashboardData()

    public int getPendingRequestCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM requested_appointment";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public int getTodayAppointmentCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE date = ? AND status = 'Scheduled'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, LocalDate.now());
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public int getWeekCompletedCount() throws SQLException {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        String sql = "SELECT COUNT(*) FROM scheduled_appointments WHERE status = 'Completed' AND date >= ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, weekAgo);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /**
     * Get recent appointment requests (limited to 5).
     * Mirrors: receptionist/dashboard/page.tsx → requestsData fetch
     */
    public List<RequestedAppointment> getRecentRequests() throws SQLException {
        String sql = "SELECT ra.p_id, ra.d_id, p.name AS patient_name, d.name AS doctor_name, d.department " +
                     "FROM requested_appointment ra " +
                     "JOIN patient p ON ra.p_id = p.p_id " +
                     "JOIN doctor d ON ra.d_id = d.d_id " +
                     "LIMIT 5";
        List<RequestedAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                RequestedAppointment req = new RequestedAppointment();
                req.setPId(rs.getString("p_id"));
                req.setDId(rs.getString("d_id"));
                req.setPatientName(rs.getString("patient_name"));
                req.setDoctorName(rs.getString("doctor_name"));
                req.setDoctorDepartment(rs.getString("department"));
                result.add(req);
            }
        }
        return result;
    }

    // ─── Appointment Requests ──────────────────────────────────────────
    // Mirrors: receptionist/requests/page.tsx → loadRequests()

    /**
     * Get all pending appointment requests with patient and doctor details.
     */
    public List<RequestedAppointment> getAllRequests() throws SQLException {
        String sql = "SELECT ra.p_id, ra.d_id, p.name AS patient_name, p.phone, p.blood_group, " +
                     "d.name AS doctor_name, d.department " +
                     "FROM requested_appointment ra " +
                     "JOIN patient p ON ra.p_id = p.p_id " +
                     "JOIN doctor d ON ra.d_id = d.d_id";
        List<RequestedAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                RequestedAppointment req = new RequestedAppointment();
                req.setPId(rs.getString("p_id"));
                req.setDId(rs.getString("d_id"));
                req.setPatientName(rs.getString("patient_name"));
                req.setPatientPhone(rs.getString("phone"));
                req.setPatientBloodGroup(rs.getString("blood_group"));
                req.setDoctorName(rs.getString("doctor_name"));
                req.setDoctorDepartment(rs.getString("department"));
                result.add(req);
            }
        }
        return result;
    }

    // ─── Scheduled Appointments ────────────────────────────────────────
    // Mirrors: receptionist/scheduled/page.tsx

    /**
     * Get all scheduled appointments with patient and doctor names.
     * Mirrors: loadAppointments() in scheduled/page.tsx
     */
    public List<ScheduledAppointment> getAllAppointments() throws SQLException {
        String sql = "SELECT sa.a_id, sa.p_id, sa.d_id, sa.date, sa.start_time, sa.end_time, sa.status, " +
                     "p.name AS patient_name, d.name AS doctor_name " +
                     "FROM scheduled_appointments sa " +
                     "JOIN patient p ON sa.p_id = p.p_id " +
                     "JOIN doctor d ON sa.d_id = d.d_id " +
                     "ORDER BY sa.date DESC, sa.start_time DESC";
        List<ScheduledAppointment> result = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ScheduledAppointment apt = new ScheduledAppointment();
                apt.setAId(rs.getString("a_id"));
                apt.setPId(rs.getString("p_id"));
                apt.setDId(rs.getString("d_id"));
                apt.setDate(rs.getObject("date", LocalDate.class));
                apt.setStartTime(rs.getObject("start_time", LocalTime.class));
                apt.setEndTime(rs.getObject("end_time", LocalTime.class));
                apt.setStatus(AppointmentStatus.fromString(rs.getString("status")));
                apt.setPatientName(rs.getString("patient_name"));
                apt.setDoctorName(rs.getString("doctor_name"));
                result.add(apt);
            }
        }
        return result;
    }

    /**
     * Filter appointments by status and/or date.
     * Mirrors: applyFilters() in scheduled/page.tsx
     * 
     * Observer Pattern equivalent: useEffect watches statusFilter and dateFilter
     */
    public List<ScheduledAppointment> filterAppointments(List<ScheduledAppointment> appointments,
                                                          String statusFilter, String dateFilter) {
        List<ScheduledAppointment> filtered = new ArrayList<>(appointments);
        if (statusFilter != null && !statusFilter.equals("All")) {
            filtered.removeIf(apt -> !apt.getStatus().getValue().equals(statusFilter));
        }
        if (dateFilter != null && !dateFilter.isEmpty()) {
            LocalDate filterDate = LocalDate.parse(dateFilter);
            filtered.removeIf(apt -> !apt.getDate().equals(filterDate));
        }
        return filtered;
    }

    /**
     * Cancel a scheduled appointment.
     * Mirrors: handleCancelAppointment() in scheduled/page.tsx
     * Uses optimistic UI update pattern — status changes immediately.
     * 
     * @return null on success, error message on failure
     */
    public String cancelAppointment(String appointmentId) {
        String sql = "UPDATE scheduled_appointments SET status = 'Cancelled' WHERE a_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, appointmentId);
            int rows = stmt.executeUpdate();
            if (rows == 0) return "Appointment not found";
            return null; // success
        } catch (SQLException e) {
            return "Failed to cancel appointment: " + e.getMessage();
        }
    }
}
