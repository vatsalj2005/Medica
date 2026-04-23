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
 * Concrete Strategy for doctor authentication.
 * 
 * Design Pattern: Strategy (Behavioral)
 * Mirrors: lib/auth.ts — doctor table lookup block
 */
public class DoctorAuthStrategy implements AuthStrategy {

    @Override
    public AuthSession authenticate(String email, String password) throws SQLException {
        Connection conn = SupabaseClient.getInstance().getConnection();
        if (conn == null) return null;

        String sql = "SELECT d_id, name, email, password FROM doctor WHERE email = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String hashedPassword = rs.getString("password");
                    if (BCrypt.checkpw(password, hashedPassword)) {
                        AuthUser user = new AuthUser(
                            rs.getString("d_id"),
                            rs.getString("name"),
                            rs.getString("email")
                        );
                        return new AuthSession(UserRole.DOCTOR, user);
                    }
                }
            }
        }
        return null;
    }
}
