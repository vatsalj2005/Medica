package com.medica.ui;

import com.medica.model.*;
import com.medica.observer.ToastManager;
import com.medica.observer.ToastType;
import com.medica.service.DoctorService;

import java.sql.SQLException;
import java.util.List;

/**
 * Doctor role menu and screens.
 * 
 * Mirrors: app/doctor/layout.tsx (sidebar navigation) +
 *          app/doctor/dashboard/page.tsx, appointments/page.tsx,
 *          patients/page.tsx, patients/[P_ID]/page.tsx
 */
public class DoctorMenu {

    private final DoctorService doctorService;
    private final AuthSession session;

    public DoctorMenu(AuthSession session) {
        this.session = session;
        this.doctorService = new DoctorService();
    }

    /**
     * Main doctor menu loop.
     * Mirrors: sidebar navigation in doctor/layout.tsx
     */
    public void run() {
        while (true) {
            ConsoleUI.printMenu(
                "Doctor — " + session.getUser().getName(),
                "Dashboard",
                "My Appointments",
                "My Patients",
                "Logout"
            );

            int choice = ConsoleUI.readChoice("  Choose: ", 1, 4);

            try {
                switch (choice) {
                    case 1: showDashboard(); break;
                    case 2: showAppointments(); break;
                    case 3: showPatients(); break;
                    case 4: return;
                }
            } catch (SQLException e) {
                ConsoleUI.printError("Database error: " + e.getMessage());
                ConsoleUI.pressEnterToContinue();
            }
        }
    }

    /**
     * Doctor dashboard with stats and today's schedule.
     * Mirrors: doctor/dashboard/page.tsx
     */
    private void showDashboard() throws SQLException {
        String did = session.getUser().getId();
        ConsoleUI.printHeader(ConsoleUI.getGreeting() + ", " + session.getUser().getName() + " 👋");
        System.out.println("  Here's your schedule for today\n");

        // Stats
        ConsoleUI.printStat("Today's Scheduled", doctorService.getTodayScheduledCount(did));
        ConsoleUI.printStat("Total Completed", doctorService.getTotalCompletedCount(did));
        ConsoleUI.printStat("Unique Patients", doctorService.getUniquePatientCount(did));

        // Today's schedule
        List<ScheduledAppointment> schedule = doctorService.getTodaySchedule(did);
        ConsoleUI.printSubHeader("Today's Schedule");
        if (schedule.isEmpty()) {
            ConsoleUI.printEmpty("No appointments scheduled for today");
        } else {
            ConsoleUI.printTableHeader("Time", "Patient", "Age", "Blood Group");
            for (ScheduledAppointment apt : schedule) {
                ConsoleUI.printTableRow(
                    ConsoleUI.formatTime(apt.getStartTime()) + "-" + ConsoleUI.formatTime(apt.getEndTime()),
                    apt.getPatientName(),
                    apt.getPatientAge() + " years",
                    apt.getPatientBloodGroup()
                );
            }
        }

        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View all appointments with option to complete scheduled ones.
     * Mirrors: doctor/appointments/page.tsx
     */
    private void showAppointments() throws SQLException {
        String did = session.getUser().getId();
        ConsoleUI.printHeader("My Appointments");

        List<ScheduledAppointment> appointments = doctorService.getAllAppointments(did);
        if (appointments.isEmpty()) {
            ConsoleUI.printEmpty("No appointments found");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        System.out.println("  #   Patient              Age        Date            Time              Status");
        ConsoleUI.printDivider();
        for (int i = 0; i < appointments.size(); i++) {
            ScheduledAppointment apt = appointments.get(i);
            System.out.printf("  %-3d %-20s %-10s %-15s %-17s %s%n",
                (i + 1), apt.getPatientName(), apt.getPatientAge() + " yrs",
                ConsoleUI.formatDate(apt.getDate()),
                ConsoleUI.formatTime(apt.getStartTime()) + "-" + ConsoleUI.formatTime(apt.getEndTime()),
                apt.getStatus().getValue());
        }

        System.out.println("\n  Enter appointment number to complete (scheduled only), 0 to go back:");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, appointments.size());
        if (choice == 0) return;

        ScheduledAppointment selected = appointments.get(choice - 1);
        if (selected.getStatus() != AppointmentStatus.SCHEDULED) {
            ConsoleUI.printError("Only scheduled appointments can be completed");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Completion form
        doCompleteAppointment(selected);
    }

    /**
     * Complete an appointment — fill in medical details.
     * 
     * Design Pattern: Template Method — follows fixed sequence:
     *   1. Validate form → 2. Update status → 3. Insert summary → 4. Insert history
     * 
     * Mirrors: the completion modal in doctor/appointments/page.tsx
     */
    private void doCompleteAppointment(ScheduledAppointment apt) {
        ConsoleUI.printSubHeader("Complete Appointment — " + apt.getPatientName());

        System.out.println("  Fill in the medical details:\n");

        String symptoms = ConsoleUI.readLine("Symptoms (min 10 chars): ");
        String diagnosis = ConsoleUI.readLine("Diagnosis (min 10 chars): ");
        String prescription = ConsoleUI.readLine("Prescription (min 10 chars): ");
        String healthCondition = ConsoleUI.readLine("Health Condition: ");
        String treatment = ConsoleUI.readLine("Treatment: ");

        System.out.println("  Condition Type:");
        System.out.println("  [1] Acute  [2] Chronic  [3] Preventive");
        int typeChoice = ConsoleUI.readChoice("  Select type: ", 1, 3);
        String type = switch (typeChoice) {
            case 1 -> "Acute";
            case 2 -> "Chronic";
            case 3 -> "Preventive";
            default -> "Acute";
        };

        // Validate
        List<String> errors = doctorService.validateCompletionForm(
            symptoms, diagnosis, prescription, healthCondition, treatment
        );
        if (!errors.isEmpty()) {
            System.out.println("\n  Validation errors:");
            for (String error : errors) {
                ConsoleUI.printError(error);
            }
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Submit
        System.out.println("\n  Submitting...");
        String error = doctorService.completeAppointment(
            apt.getAId(), apt.getPId(), session.getUser().getId(),
            apt.getDate().toString(), symptoms, diagnosis, prescription,
            healthCondition, treatment, type
        );

        if (error != null) {
            ToastManager.showToast(error, ToastType.ERROR);
        } else {
            ToastManager.showToast("Appointment completed successfully", ToastType.SUCCESS);
        }
        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View treated patients with option to see patient details.
     * Mirrors: doctor/patients/page.tsx
     */
    private void showPatients() throws SQLException {
        String did = session.getUser().getId();
        ConsoleUI.printHeader("My Patients");

        List<Patient> patients = doctorService.getMyPatients(did);
        if (patients.isEmpty()) {
            ConsoleUI.printEmpty("No patients found");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        System.out.println("  #   Patient              Age        Blood Group  Gender      Phone");
        ConsoleUI.printDivider();
        for (int i = 0; i < patients.size(); i++) {
            Patient p = patients.get(i);
            System.out.printf("  %-3d %-20s %-10s %-12s %-11s %s%n",
                (i + 1), p.getName(), p.getAge() + " yrs",
                p.getBloodGroup(), p.getGender(), p.getPhone());
        }

        System.out.println("\n  Enter patient number to view medical history, 0 to go back:");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, patients.size());
        if (choice == 0) return;

        // Show patient detail page
        showPatientDetail(patients.get(choice - 1).getPId());
    }

    /**
     * Patient detail view with medical history.
     * Mirrors: doctor/patients/[P_ID]/page.tsx
     */
    private void showPatientDetail(String patientId) throws SQLException {
        String did = session.getUser().getId();

        // Access control — check if doctor has treated this patient
        if (!doctorService.hasTreatedPatient(did, patientId)) {
            ConsoleUI.printError("Access denied — you have not treated this patient");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        Patient patient = doctorService.getPatientDetail(patientId);
        if (patient == null) {
            ConsoleUI.printError("Patient not found");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Patient info
        ConsoleUI.printHeader("Patient — " + patient.getName());
        ConsoleUI.printStat("Age", patient.getAge() + " years");
        ConsoleUI.printStat("Blood Group", patient.getBloodGroup());
        ConsoleUI.printStat("Gender", patient.getGender());
        ConsoleUI.printStat("Phone", patient.getPhone());
        ConsoleUI.printStat("Email", patient.getEmail());

        // Medical history from this doctor's consultations
        List<MedicalHistory> history = doctorService.getPatientMedicalHistory(did, patientId);
        ConsoleUI.printSubHeader("Medical History (Your Consultations)");
        if (history.isEmpty()) {
            ConsoleUI.printEmpty("No medical history available");
        } else {
            ConsoleUI.printTableHeader("Date", "Health Condition", "Treatment", "Type");
            for (MedicalHistory record : history) {
                ConsoleUI.printTableRow(
                    ConsoleUI.formatDate(record.getDate()),
                    record.getHealthCondition(),
                    record.getTreatment(),
                    record.getType().getValue()
                );
            }
        }

        ConsoleUI.pressEnterToContinue();
    }
}
