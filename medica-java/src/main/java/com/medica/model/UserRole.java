package com.medica.model;

/**
 * Enum representing user roles in the system.
 * Maps to the three database tables: patient, doctor, receptionist.
 * 
 * TypeScript equivalent: type UserRole = 'patient' | 'doctor' | 'receptionist'
 */
public enum UserRole {
    PATIENT("patient"),
    DOCTOR("doctor"),
    RECEPTIONIST("receptionist");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromString(String text) {
        for (UserRole role : UserRole.values()) {
            if (role.value.equalsIgnoreCase(text)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + text);
    }
}
