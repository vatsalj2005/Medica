package com.medica.observer;

import java.util.ArrayList;
import java.util.List;

/**
 * Observable toast notification manager.
 * 
 * Design Pattern: Observer (Behavioral)
 * Mirrors: context/ToastContext.tsx — ToastProvider + useToast()
 * 
 * In TypeScript, the ToastContext implements the Observer pattern:
 * - Components subscribe via useToast()
 * - showToast() notifies all subscribed components
 * 
 * In Java, ToastManager is the Subject (Observable):
 * - Observers register via subscribe()
 * - showToast() notifies all registered observers
 * 
 * TypeScript equivalent:
 *   const { showToast } = useToast();
 *   showToast('Appointment scheduled', 'success');
 * 
 * Java usage:
 *   ToastManager.showToast("Appointment scheduled", ToastType.SUCCESS);
 */
public class ToastManager {
    private static final List<Observer> observers = new ArrayList<>();

    /**
     * Subscribe an observer to receive toast notifications.
     */
    public static void subscribe(Observer observer) {
        observers.add(observer);
    }

    /**
     * Unsubscribe an observer.
     */
    public static void unsubscribe(Observer observer) {
        observers.remove(observer);
    }

    /**
     * Show a toast notification — notifies all subscribed observers.
     * Mirrors: showToast(message, type) from ToastContext.
     */
    public static void showToast(String message, ToastType type) {
        for (Observer observer : observers) {
            observer.update(message, type);
        }
    }
}
