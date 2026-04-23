package com.medica.observer;

/**
 * Observer interface for the Observer Pattern.
 * 
 * Design Pattern: Observer (Behavioral)
 * Mirrors: context/ToastContext.tsx — components subscribe via useToast()
 * 
 * Java Equivalent of:
 *   interface Observer { void update(String message, ToastType type); }
 */
public interface Observer {
    void update(String message, ToastType type);
}
