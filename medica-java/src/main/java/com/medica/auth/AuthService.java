package com.medica.auth;

import com.medica.db.SupabaseClient;
import com.medica.model.AuthSession;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Main authentication service that orchestrates login, session management, and email checks.
 * 
 * Design Pattern: Strategy (Behavioral) — uses AuthStrategy implementations sequentially
 * Mirrors: lib/auth.ts — loginUser(), getSession(), clearSession(), checkEmailExists()
 * 
 * Design Principle: Open/Closed Principle — new roles can be added by appending a new
 * strategy to the list without modifying existing logic.
 * Design Principle: Single Responsibility — only responsible for authentication logic.
 */
public class AuthService {
    
    /**
     * List of authentication strategies, tried in sequence.
     * Mirrors the sequential try-catch blocks in loginUser().
     */
    private final List<AuthStrategy> strategies = List.of(
        new PatientAuthStrategy(),
        new DoctorAuthStrategy(),
        new ReceptionistAuthStrategy()
    );

    /** Currently active session (replaces localStorage in the browser) */
    private AuthSession currentSession = null;

    /**
     * Attempt to log in with email and password.
     * Tries each role's strategy in sequence (patient → doctor → receptionist).
     * 
     * Mirrors: lib/auth.ts → loginUser(email, password)
     * 
     * @return AuthSession if login succeeds, null otherwise
     */
    public AuthSession loginUser(String email, String password) {
        for (AuthStrategy strategy : strategies) {
            try {
                AuthSession session = strategy.authenticate(email, password);
                if (session != null) {
                    this.currentSession = session;
                    return session;
                }
            } catch (SQLException e) {
                System.err.println("  Database error during authentication: " + e.getMessage());
            }
        }
        return null;
    }

    /**
     * Get the current active session.
     * Mirrors: lib/auth.ts → getSession()
     * In the TS version, this reads from localStorage; here we hold it in memory.
     */
    public AuthSession getSession() {
        return currentSession;
    }

    /**
     * Clear the current session (logout).
     * Mirrors: lib/auth.ts → clearSession()
     */
    public void clearSession() {
        this.currentSession = null;
    }

    /**
     * Check if an email already exists in any of the three role tables.
     * Mirrors: lib/auth.ts → checkEmailExists(email)
     * 
     * @return true if email exists in patient, doctor, or receptionist table
     */
    public boolean checkEmailExists(String email) {
        Connection conn = SupabaseClient.getInstance().getConnection();
        if (conn == null) return false;

        String[] tables = {"patient", "doctor", "receptionist"};
        for (String table : tables) {
            try {
                String sql = "SELECT email FROM " + table + " WHERE email = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, email);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) return true;
                    }
                }
            } catch (SQLException e) {
                System.err.println("  Error checking email in " + table + ": " + e.getMessage());
            }
        }
        return false;
    }
}
