package com.medica.auth;

import com.medica.model.AuthSession;
import java.sql.SQLException;

/**
 * Strategy interface for authentication.
 * 
 * Design Pattern: Strategy (Behavioral)
 * Mirrors: lib/auth.ts — loginUser() tries each role's authentication strategy in sequence.
 * 
 * Each concrete strategy queries a different database table (patient, doctor, receptionist)
 * and verifies credentials independently.
 * 
 * Design Principle: Open/Closed Principle — new roles can be added by creating a new
 * strategy class without modifying existing ones.
 * 
 * TypeScript equivalent:
 *   // Strategy 1: Patient authentication
 *   const { data: patientData } = await supabase.from('patient')...
 *   // Strategy 2: Doctor authentication
 *   const { data: doctorData } = await supabase.from('doctor')...
 *   // Strategy 3: Receptionist authentication
 *   const { data: receptionistData } = await supabase.from('receptionist')...
 */
public interface AuthStrategy {
    /**
     * Attempt to authenticate a user with the given credentials.
     * 
     * @param email    User's email address
     * @param password User's plaintext password (to be compared with bcrypt hash)
     * @return AuthSession if authentication succeeds, null otherwise
     * @throws SQLException if a database error occurs
     */
    AuthSession authenticate(String email, String password) throws SQLException;
}
