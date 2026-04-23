package com.medica.observer;

/**
 * Enum representing toast notification types.
 * 
 * TypeScript equivalent: type ToastType = 'success' | 'error' | 'info'
 */
public enum ToastType {
    SUCCESS("SUCCESS", "✓"),
    ERROR("ERROR", "✗"),
    INFO("INFO", "ℹ");

    private final String label;
    private final String icon;

    ToastType(String label, String icon) {
        this.label = label;
        this.icon = icon;
    }

    public String getLabel() { return label; }
    public String getIcon() { return icon; }
}
