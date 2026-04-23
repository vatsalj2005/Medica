package com.medica.service;

import com.medica.db.SupabaseClient;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Facade for the appointment scheduling workflow.
 * 
 * Design Pattern: Facade (Structural)
 * Mirrors: receptionist/requests/page.tsx → handleSubmit()
 * 
 * The handleSubmit() function in the scheduling modal is a Facade. It presents a
 * single, simple interface (scheduleAppointment) while internally orchestrating:
 *   1. Date validation
 *   2. Time validation
 *   3. Conflict detection (with overlap algorithm)
 *   4. ID generation
 *   5. Database insert (scheduled_appointments)
 *   6. Database delete (requested_appointment)
 * 
 * Design Principle: Separation of Concerns — conflict detection logic is isolated
 * in checkTimeConflict(), separate from the scheduling handler.
 * 
 * TypeScript equivalent:
 *   class AppointmentSchedulingFacade {
 *       public void scheduleAppointment(ScheduleRequest req) {
 *           validator.validateDate(req);
 *           conflictDetector.check(req);
 *           String id = idGenerator.generate();
 *           appointmentRepo.save(id, req);
 *           requestRepo.delete(req);
 *       }
 *   }
 */
public class AppointmentSchedulingFacade {

    private final Connection conn;

    public AppointmentSchedulingFacade() {
        this.conn = SupabaseClient.getInstance().getConnection();
    }

    /**
     * Schedule an appointment — the single entry point that hides all complexity.
     * 
     * @return null on success, error message on failure
     */
    public String scheduleAppointment(String patientId, String doctorId,
                                        LocalDate date, LocalTime startTime, LocalTime endTime) {
        // Step 1: Validate date — cannot be in the past
        if (date.isBefore(LocalDate.now())) {
            return "Cannot schedule appointments in the past";
        }

        // Step 2: Validate time — end must be after start
        if (!endTime.isAfter(startTime)) {
            return "End time must be after start time";
        }

        // Step 3: Check for time conflicts
        try {
            String conflictResult = checkTimeConflict(doctorId, date, startTime, endTime);
            if (conflictResult != null) {
                return conflictResult;
            }
        } catch (SQLException e) {
            return "Error checking conflicts: " + e.getMessage();
        }

        try {
            // Step 4: Generate appointment ID
            String appointmentId = generateAppointmentId();

            // Step 5: Insert into scheduled_appointments
            String insertSql = "INSERT INTO scheduled_appointments (a_id, p_id, d_id, date, start_time, end_time, status) " +
                               "VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')";
            try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
                stmt.setString(1, appointmentId);
                stmt.setString(2, patientId);
                stmt.setString(3, doctorId);
                stmt.setObject(4, date);
                stmt.setObject(5, startTime);
                stmt.setObject(6, endTime);
                stmt.executeUpdate();
            }

            // Step 6: Delete from requested_appointment
            String deleteSql = "DELETE FROM requested_appointment WHERE p_id = ? AND d_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
                stmt.setString(1, patientId);
                stmt.setString(2, doctorId);
                stmt.executeUpdate();
            }

            return null; // success
        } catch (SQLException e) {
            return "Failed to schedule appointment: " + e.getMessage();
        }
    }

    /**
     * Check for time conflicts with the doctor's existing appointments.
     * 
     * Mirrors: checkTimeConflict() in receptionist/requests/page.tsx
     * 
     * Checks all three overlap cases:
     *   1. Start time falls inside an existing appointment
     *   2. End time falls inside an existing appointment
     *   3. New appointment fully contains an existing appointment
     * 
     * @return null if no conflict, error message with conflict details if conflict exists
     */
    private String checkTimeConflict(String doctorId, LocalDate date,
                                      LocalTime startTime, LocalTime endTime) throws SQLException {
        String sql = "SELECT start_time, end_time FROM scheduled_appointments " +
                     "WHERE d_id = ? AND date = ? AND status != 'Cancelled'";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, doctorId);
            stmt.setObject(2, date);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                LocalTime existingStart = rs.getObject("start_time", LocalTime.class);
                LocalTime existingEnd = rs.getObject("end_time", LocalTime.class);

                // Check overlap: start inside, end inside, or fully contains
                boolean startInside = !startTime.isBefore(existingStart) && startTime.isBefore(existingEnd);
                boolean endInside = endTime.isAfter(existingStart) && !endTime.isAfter(existingEnd);
                boolean fullyContains = !startTime.isAfter(existingStart) && !endTime.isBefore(existingEnd);

                if (startInside || endInside || fullyContains) {
                    return "Time conflict: Doctor has an appointment from " +
                           existingStart + " to " + existingEnd + " on this date.";
                }
            }
        }
        return null; // no conflict
    }

    /**
     * Generate the next appointment ID.
     * Mirrors: generateAppointmentId() in receptionist/requests/page.tsx
     * 
     * Pattern: A001, A002, A003, ...
     */
    private String generateAppointmentId() throws SQLException {
        String sql = "SELECT a_id FROM scheduled_appointments ORDER BY a_id DESC LIMIT 1";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                String lastId = rs.getString("a_id");
                int num = Integer.parseInt(lastId.substring(1)) + 1;
                return String.format("A%03d", num);
            }
        }
        return "A001";
    }
}
