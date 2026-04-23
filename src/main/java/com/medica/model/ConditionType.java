package com.medica.model;

/**
 * Enum representing the type of medical condition.
 * Maps to the 'type' column in the 'medical_history' table.
 */
public enum ConditionType {
    ACUTE("Acute"),
    CHRONIC("Chronic"),
    PREVENTIVE("Preventive");

    private final String value;

    ConditionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ConditionType fromString(String text) {
        for (ConditionType type : ConditionType.values()) {
            if (type.value.equalsIgnoreCase(text)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown condition type: " + text);
    }
}
