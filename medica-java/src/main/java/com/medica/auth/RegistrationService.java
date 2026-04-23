package com.medica.auth;

import com.medica.db.SupabaseClient;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * Patient registration service with form validation and auto-ID generation.
 * 
 * Mirrors: app/(auth)/register/page.tsx — validateForm(), generatePatientId(), handleSubmit()
 * 
 * Design Principle: Single Responsibility — only responsible for patient registration.
 */
public class RegistrationService {

    private static final String[] BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"};
    private static final String[] GENDERS = {"Male", "Female", "Other"};

    /**
     * Validate registration form data.
     * Mirrors the validateForm() function in register/page.tsx.
     * 
     * @return Map of field name → error message. Empty map means valid.
     */
    public Map<String, String> validateForm(String name, String age, String bloodGroup,
                                             String gender, String email, String phone,
                                             String password, String confirmPassword) {
        Map<String, String> errors = new HashMap<>();

        if (name == null || name.trim().isEmpty()) {
            errors.put("name", "Full name is required");
        }

        if (age == null || age.trim().isEmpty()) {
            errors.put("age", "Valid age is required");
        } else {
            try {
                int ageInt = Integer.parseInt(age.trim());
                if (ageInt <= 0) errors.put("age", "Valid age is required");
            } catch (NumberFormatException e) {
                errors.put("age", "Age must be a number");
            }
        }

        if (bloodGroup == null || bloodGroup.trim().isEmpty()) {
            errors.put("bloodGroup", "Blood group is required");
        } else {
            boolean validBlood = false;
            for (String bg : BLOOD_GROUPS) {
                if (bg.equals(bloodGroup.trim())) { validBlood = true; break; }
            }
            if (!validBlood) errors.put("bloodGroup", "Invalid blood group");
        }

        if (gender == null || gender.trim().isEmpty()) {
            errors.put("gender", "Gender is required");
        } else {
            boolean validGender = false;
            for (String g : GENDERS) {
                if (g.equalsIgnoreCase(gender.trim())) { validGender = true; break; }
            }
            if (!validGender) errors.put("gender", "Invalid gender");
        }

        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!email.contains("@") || !email.contains(".")) {
            errors.put("email", "Invalid email format");
        }

        if (phone == null || phone.trim().isEmpty()) {
            errors.put("phone", "Phone is required");
        } else {
            String digitsOnly = phone.replaceAll("\\D", "");
            if (digitsOnly.length() != 10) {
                errors.put("phone", "Phone must be 10 digits");
            }
        }

        if (password == null || password.isEmpty()) {
            errors.put("password", "Password is required");
        } else if (password.length() < 8) {
            errors.put("password", "Password must be at least 8 characters");
        }

        if (confirmPassword == null || !confirmPassword.equals(password)) {
            errors.put("confirmPassword", "Passwords do not match");
        }

        return errors;
    }

    /**
     * Generate the next patient ID by querying the last ID and incrementing.
     * Mirrors: generatePatientId() in register/page.tsx
     * 
     * Pattern: P001, P002, P003, ...
     */
    public String generatePatientId() throws SQLException {
        Connection conn = SupabaseClient.getInstance().getConnection();
        if (conn == null) return "P001";

        String sql = "SELECT p_id FROM patient ORDER BY p_id DESC LIMIT 1";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                String lastId = rs.getString("p_id");
                int numericPart = Integer.parseInt(lastId.substring(1));
                return String.format("P%03d", numericPart + 1);
            }
        }
        return "P001";
    }

    /**
     * Register a new patient.
     * Mirrors: handleSubmit() in register/page.tsx
     * 
     * @return null on success, error message on failure
     */
    public String registerPatient(String name, int age, String bloodGroup,
                                   String gender, String email, String phone,
                                   String password) {
        Connection conn = SupabaseClient.getInstance().getConnection();
        if (conn == null) return "Database connection unavailable";

        try {
            String patientId = generatePatientId();
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(10));

            String sql = "INSERT INTO patient (p_id, name, age, blood_group, gender, email, phone, password) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, patientId);
                stmt.setString(2, name);
                stmt.setInt(3, age);
                stmt.setString(4, bloodGroup);
                stmt.setString(5, gender);
                stmt.setString(6, email);
                stmt.setString(7, phone);
                stmt.setString(8, hashedPassword);
                stmt.executeUpdate();
            }
            return null; // success
        } catch (SQLException e) {
            if (e.getSQLState() != null && e.getSQLState().equals("23505")) {
                return "Email already registered";
            }
            return "Registration failed: " + e.getMessage();
        }
    }

    public String[] getBloodGroups() { return BLOOD_GROUPS; }
    public String[] getGenders() { return GENDERS; }
}
