package com.medica.model;

/**
 * Enum representing the status of a scheduled appointment.
 * Maps to the 'status' column in the 'scheduled_appointments' table.
 */
public enum AppointmentStatus {
    SCHEDULED("Scheduled"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String value;

    AppointmentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AppointmentStatus fromString(String text) {
        for (AppointmentStatus status : AppointmentStatus.values()) {
            if (status.value.equalsIgnoreCase(text)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + text);
    }
}
