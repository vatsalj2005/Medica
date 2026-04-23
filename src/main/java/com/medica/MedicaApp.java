package com.medica;

import com.medica.auth.AuthService;
import com.medica.auth.RegistrationService;
import com.medica.db.SupabaseClient;
import com.medica.model.AuthSession;
import com.medica.model.UserRole;
import com.medica.observer.ToastManager;
import com.medica.ui.*;

/**
 * Main entry point for the Medica application.
 * 
 * Wires together all components:
 * - Singleton database connection (SupabaseClient)
 * - Strategy-based authentication (AuthService)
 * - Observer-based toast notifications (ToastManager + ConsoleUI)
 * - Role-based menu routing (PatientMenu / DoctorMenu / ReceptionistMenu)
 * 
 * Mirrors: app/layout.tsx + middleware.ts + page routing logic
 * 
 * Architecture: MVC
 * - Model: model/ package (POJOs + enums)
 * - View: ui/ package (Console menus)
 * - Controller: service/ package (Business logic)
 */
public class MedicaApp {

    public static void main(String[] args) {
        // Initialize the ConsoleUI observer for toast notifications
        ConsoleUI consoleUI = new ConsoleUI();
        ToastManager.subscribe(consoleUI);

        // Initialize auth services
        AuthService authService = new AuthService();
        RegistrationService registrationService = new RegistrationService();
        LoginUI loginUI = new LoginUI(authService, registrationService);

        // Check database connectivity
        if (!SupabaseClient.getInstance().isConnected()) {
            System.err.println("\n  ⚠ Cannot start Medica without a database connection.");
            System.err.println("  Please check your config.properties file.\n");
            return;
        }

        // Main application loop
        boolean running = true;
        while (running) {
            // Show login screen
            AuthSession session = loginUI.showLoginScreen();

            if (session == null) {
                // User chose to exit
                running = false;
                continue;
            }

            // Route to role-specific menu
            // Mirrors: middleware.ts role-based redirect logic
            switch (session.getRole()) {
                case PATIENT:
                    new PatientMenu(session).run();
                    break;
                case DOCTOR:
                    new DoctorMenu(session).run();
                    break;
                case RECEPTIONIST:
                    new ReceptionistMenu(session).run();
                    break;
            }

            // Session ended (user logged out), clear session
            authService.clearSession();
            ConsoleUI.printSuccess("Logged out successfully");
        }

        // Cleanup
        SupabaseClient.getInstance().close();
        ConsoleUI.printHeader("Thank you for using Medica! 👋");
    }
}
