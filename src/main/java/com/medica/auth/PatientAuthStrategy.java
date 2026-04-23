package com.medica.auth;

import com.medica.db.SupabaseClient;
import com.medica.model.AuthSession;
import com.medica.model.AuthUser;
import com.medica.model.UserRole;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Concrete Strategy for patient authentication.
 * 
 * Design Pattern: Strategy (Behavioral)
 * Mirrors: lib/auth.ts — patient table lookup block
 * 
 * TypeScript equivalent:
 *   const { data: patientData } = await supabase
 *     .from('patient').select('p_id, name, email, password').eq('email', email).single();
 *   if (patientData) { const isValid = await bcrypt.compare(password, patientData.password); ... }
 */
public class PatientAuthStrategy implements AuthStrategy {

    @Override
    public AuthSession authenticate(String email, String password) throws SQLException {
        Connection conn = SupabaseClient.getInstance().getConnection();
        if (conn == null) return null;

        String sql = "SELECT p_id, name, email, password FROM patient WHERE email = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String hashedPassword = rs.getString("password");
                    if (BCrypt.checkpw(password, hashedPassword)) {
                        AuthUser user = new AuthUser(
                            rs.getString("p_id"),
                            rs.getString("name"),
                            rs.getString("email")
                        );
                        return new AuthSession(UserRole.PATIENT, user);
                    }
                }
            }
        }
        return null;
    }
}
