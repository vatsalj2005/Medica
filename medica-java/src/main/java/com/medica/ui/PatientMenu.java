package com.medica.ui;

import com.medica.model.*;
import com.medica.observer.ToastManager;
import com.medica.observer.ToastType;
import com.medica.service.PatientService;

import java.sql.SQLException;
import java.util.List;

/**
 * Patient role menu and screens.
 * 
 * Mirrors: app/patient/layout.tsx (sidebar navigation) +
 *          app/patient/dashboard/page.tsx, appointments/page.tsx,
 *          request-appointment/page.tsx, medical-history/page.tsx
 */
public class PatientMenu {

    private final PatientService patientService;
    private final AuthSession session;

    public PatientMenu(AuthSession session) {
        this.session = session;
        this.patientService = new PatientService();
    }

    /**
     * Main patient menu loop.
     * Mirrors: sidebar navigation in patient/layout.tsx
     */
    public void run() {
        while (true) {
            ConsoleUI.printMenu(
                "Patient — " + session.getUser().getName(),
                "Dashboard",
                "Request Appointment",
                "My Appointments",
                "Medical History",
                "Logout"
            );

            int choice = ConsoleUI.readChoice("  Choose: ", 1, 5);

            try {
                switch (choice) {
                    case 1: showDashboard(); break;
                    case 2: showRequestAppointment(); break;
                    case 3: showAppointments(); break;
                    case 4: showMedicalHistory(); break;
                    case 5: return;
                }
            } catch (SQLException e) {
                ConsoleUI.printError("Database error: " + e.getMessage());
                ConsoleUI.pressEnterToContinue();
            }
        }
    }

    /**
     * Patient dashboard with stats and upcoming appointments.
     * Mirrors: patient/dashboard/page.tsx
     */
    private void showDashboard() throws SQLException {
        String pid = session.getUser().getId();
        ConsoleUI.printHeader(ConsoleUI.getGreeting() + ", " + session.getUser().getName() + " 👋");
        System.out.println("  Here's your health dashboard overview\n");

        // Stats
        ConsoleUI.printStat("Upcoming Appointments", patientService.getUpcomingCount(pid));
        ConsoleUI.printStat("Pending Requests", patientService.getPendingRequestCount(pid));
        ConsoleUI.printStat("Total Visits", patientService.getCompletedCount(pid));

        // Upcoming appointments
        List<ScheduledAppointment> upcoming = patientService.getUpcomingAppointments(pid);
        ConsoleUI.printSubHeader("Upcoming Appointments");
        if (upcoming.isEmpty()) {
            ConsoleUI.printEmpty("No upcoming appointments");
        } else {
            ConsoleUI.printTableHeader("Doctor", "Department", "Date", "Time");
            for (ScheduledAppointment apt : upcoming) {
                ConsoleUI.printTableRow(
                    apt.getDoctorName(), apt.getDoctorDepartment(),
                    ConsoleUI.formatDate(apt.getDate()),
                    ConsoleUI.formatTime(apt.getStartTime()) + "-" + ConsoleUI.formatTime(apt.getEndTime())
                );
            }
        }

        // Pending requests
        List<RequestedAppointment> pending = patientService.getPendingRequests(pid);
        ConsoleUI.printSubHeader("Pending Requests");
        if (pending.isEmpty()) {
            ConsoleUI.printEmpty("No pending requests");
        } else {
            for (RequestedAppointment req : pending) {
                System.out.println("  ⏳ " + req.getDoctorName() + " — " + req.getDoctorDepartment());
            }
        }

        ConsoleUI.pressEnterToContinue();
    }

    /**
     * Browse doctors and request appointments.
     * Mirrors: patient/request-appointment/page.tsx
     */
    private void showRequestAppointment() throws SQLException {
        String pid = session.getUser().getId();
        ConsoleUI.printHeader("Find a Doctor");
        System.out.println("  Browse available doctors and request appointments\n");

        List<Doctor> doctors = patientService.getAllDoctors();
        if (doctors.isEmpty()) {
            ConsoleUI.printEmpty("No doctors available");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Display doctors with their status
        System.out.println("  #   Doctor               Department          Phone           Status");
        ConsoleUI.printDivider();
        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            String status = patientService.getRequestStatus(pid, doc.getDId());
            String statusLabel = switch (status) {
                case "scheduled" -> "[Scheduled ✓]";
                case "requested" -> "[Requested ⏳]";
                default -> "[Available]";
            };
            System.out.printf("  %-3d %-20s %-19s %-15s %s%n",
                (i + 1), doc.getName(), doc.getDepartment(), doc.getPhone(), statusLabel);
        }

        System.out.println("\n  Enter doctor number to request appointment (0 to go back):");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, doctors.size());
        if (choice == 0) return;

        Doctor selected = doctors.get(choice - 1);
        String status = patientService.getRequestStatus(pid, selected.getDId());
        if (!status.equals("idle")) {
            ConsoleUI.printError("You already have a " + status + " appointment with " + selected.getName());
            ConsoleUI.pressEnterToContinue();
            return;
        }

        String error = patientService.requestAppointment(pid, selected.getDId());
        if (error != null) {
            ToastManager.showToast(error, ToastType.ERROR);
        } else {
            ToastManager.showToast("Appointment request sent to " + selected.getName(), ToastType.SUCCESS);
        }
        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View all appointments with option to see completed summaries.
     * Mirrors: patient/appointments/page.tsx
     */
    private void showAppointments() throws SQLException {
        String pid = session.getUser().getId();
        ConsoleUI.printHeader("My Appointments");

        List<ScheduledAppointment> appointments = patientService.getAllAppointments(pid);
        if (appointments.isEmpty()) {
            ConsoleUI.printEmpty("No appointments found");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        System.out.println("  #   Doctor               Department      Date            Time              Status");
        ConsoleUI.printDivider();
        for (int i = 0; i < appointments.size(); i++) {
            ScheduledAppointment apt = appointments.get(i);
            System.out.printf("  %-3d %-20s %-15s %-15s %-17s %s%n",
                (i + 1), apt.getDoctorName(), apt.getDoctorDepartment(),
                ConsoleUI.formatDate(apt.getDate()),
                ConsoleUI.formatTime(apt.getStartTime()) + "-" + ConsoleUI.formatTime(apt.getEndTime()),
                apt.getStatus().getValue());
        }

        System.out.println("\n  Enter appointment number to view summary (completed only), 0 to go back:");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, appointments.size());
        if (choice == 0) return;

        ScheduledAppointment selected = appointments.get(choice - 1);
        if (selected.getStatus() != AppointmentStatus.COMPLETED) {
            ConsoleUI.printError("Summary is only available for completed appointments");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Show appointment summary
        AppointmentSummary summary = patientService.getAppointmentSummary(selected.getAId());
        ConsoleUI.printSubHeader("Appointment Summary — " + selected.getDoctorName());
        if (summary != null) {
            System.out.println("\n  SYMPTOMS:");
            System.out.println("  " + summary.getSymptoms());
            System.out.println("\n  DIAGNOSIS:");
            System.out.println("  " + summary.getDiagnosis());
            System.out.println("\n  PRESCRIPTION:");
            System.out.println("  " + summary.getPrescription());
        } else {
            ConsoleUI.printEmpty("No summary available");
        }
        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View medical history with search filtering.
     * Mirrors: patient/medical-history/page.tsx
     * 
     * Observer Pattern: In TS, useEffect watches searchTerm. Here, user enters a search
     * term and results are filtered reactively.
     */
    private void showMedicalHistory() throws SQLException {
        String pid = session.getUser().getId();
        ConsoleUI.printHeader("Medical History");

        List<MedicalHistory> records = patientService.getMedicalHistory(pid);
        if (records.isEmpty()) {
            ConsoleUI.printEmpty("No medical history available");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Search loop — mirrors the reactive search in TS
        while (true) {
            System.out.println("\n  Enter search term to filter by health condition (or press Enter to show all, 'q' to go back):");
            String searchTerm = ConsoleUI.readLine("  Search: ");

            if (searchTerm.equalsIgnoreCase("q")) return;

            List<MedicalHistory> filtered = patientService.filterByCondition(records, searchTerm);

            if (filtered.isEmpty()) {
                ConsoleUI.printEmpty("No records found matching: " + searchTerm);
                continue;
            }

            ConsoleUI.printTableHeader("Date", "Doctor", "Department", "Condition");
            for (MedicalHistory record : filtered) {
                ConsoleUI.printTableRow(
                    ConsoleUI.formatDate(record.getDate()),
                    record.getDoctorName(),
                    record.getDoctorDepartment(),
                    record.getHealthCondition()
                );
                System.out.println("  Treatment: " + record.getTreatment() + "  |  Type: " + record.getType().getValue());
                ConsoleUI.printDivider();
            }
            System.out.println("  Total records: " + filtered.size());
        }
    }
}
