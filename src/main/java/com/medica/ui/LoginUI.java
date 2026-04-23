package com.medica.ui;

import com.medica.auth.AuthService;
import com.medica.auth.RegistrationService;
import com.medica.model.AuthSession;

import java.util.Map;

/**
 * Login and registration UI screens.
 * 
 * Mirrors: app/(auth)/login/page.tsx and app/(auth)/register/page.tsx
 */
public class LoginUI {

    private final AuthService authService;
    private final RegistrationService registrationService;

    public LoginUI(AuthService authService, RegistrationService registrationService) {
        this.authService = authService;
        this.registrationService = registrationService;
    }

    /**
     * Show the main login/register menu.
     * Mirrors: the login page with a "Register as Patient" link.
     * 
     * @return AuthSession on successful login, null if user exits
     */
    public AuthSession showLoginScreen() {
        while (true) {
            ConsoleUI.printHeader("🏥 MEDICA — Medical Appointment Management");
            ConsoleUI.printMenu("Welcome", "Sign In", "Register as Patient", "Exit");

            int choice = ConsoleUI.readChoice("  Choose an option: ", 1, 3);

            switch (choice) {
                case 1:
                    AuthSession session = doLogin();
                    if (session != null) return session;
                    break;
                case 2:
                    doRegister();
                    break;
                case 3:
                    return null;
            }
        }
    }

    /**
     * Handle the login flow.
     * Mirrors: handleSubmit() in login/page.tsx
     */
    private AuthSession doLogin() {
        ConsoleUI.printSubHeader("Sign In");

        String email = ConsoleUI.readLine("Email: ");
        String password = ConsoleUI.readPassword("Password: ");

        System.out.println("\n  Signing in...");
        AuthSession session = authService.loginUser(email, password);

        if (session == null) {
            ConsoleUI.printError("Invalid email or password");
            ConsoleUI.pressEnterToContinue();
            return null;
        }

        ConsoleUI.printSuccess("Welcome, " + session.getUser().getName() + "!");
        ConsoleUI.printSuccess("Role: " + session.getRole().getValue());
        return session;
    }

    /**
     * Handle the registration flow.
     * Mirrors: RegisterPage component in register/page.tsx
     */
    private void doRegister() {
        ConsoleUI.printSubHeader("Patient Registration");
        System.out.println("  Create your Medica account\n");

        // Collect form data
        String name = ConsoleUI.readLine("Full Name: ");
        String age = ConsoleUI.readLine("Age: ");

        // Blood group selection
        System.out.println("  Blood Groups: ");
        String[] bloodGroups = registrationService.getBloodGroups();
        for (int i = 0; i < bloodGroups.length; i++) {
            System.out.print("  [" + (i + 1) + "] " + bloodGroups[i] + "  ");
            if ((i + 1) % 4 == 0) System.out.println();
        }
        System.out.println();
        int bgChoice = ConsoleUI.readChoice("  Select blood group: ", 1, bloodGroups.length);
        String bloodGroup = bloodGroups[bgChoice - 1];

        // Gender selection
        String[] genders = registrationService.getGenders();
        System.out.println("  Genders:");
        for (int i = 0; i < genders.length; i++) {
            System.out.println("  [" + (i + 1) + "] " + genders[i]);
        }
        int genderChoice = ConsoleUI.readChoice("  Select gender: ", 1, genders.length);
        String gender = genders[genderChoice - 1];

        String email = ConsoleUI.readLine("Email: ");
        String phone = ConsoleUI.readLine("Phone (10 digits): ");
        String password = ConsoleUI.readPassword("Password (min 8 chars): ");
        String confirmPassword = ConsoleUI.readPassword("Confirm Password: ");

        // Validate
        Map<String, String> errors = registrationService.validateForm(
            name, age, bloodGroup, gender, email, phone, password, confirmPassword
        );

        if (!errors.isEmpty()) {
            System.out.println("\n  Validation errors:");
            for (Map.Entry<String, String> entry : errors.entrySet()) {
                ConsoleUI.printError(entry.getValue());
            }
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Check email existence
        if (authService.checkEmailExists(email)) {
            ConsoleUI.printError("Email already registered in the system");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Register
        System.out.println("\n  Creating account...");
        String error = registrationService.registerPatient(
            name, Integer.parseInt(age.trim()), bloodGroup, gender, email, phone, password
        );

        if (error != null) {
            ConsoleUI.printError(error);
        } else {
            ConsoleUI.printSuccess("Account created successfully! You can now sign in.");
        }
        ConsoleUI.pressEnterToContinue();
    }
}
