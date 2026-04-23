package com.medica.ui;

import com.medica.model.*;
import com.medica.observer.ToastManager;
import com.medica.observer.ToastType;
import com.medica.service.AppointmentSchedulingFacade;
import com.medica.service.ReceptionistService;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Receptionist role menu and screens.
 * 
 * Mirrors: app/receptionist/layout.tsx (sidebar navigation) +
 *          app/receptionist/dashboard/page.tsx, requests/page.tsx,
 *          scheduled/page.tsx
 */
public class ReceptionistMenu {

    private final ReceptionistService receptionistService;
    private final AppointmentSchedulingFacade schedulingFacade;
    private final AuthSession session;

    public ReceptionistMenu(AuthSession session) {
        this.session = session;
        this.receptionistService = new ReceptionistService();
        this.schedulingFacade = new AppointmentSchedulingFacade();
    }

    /**
     * Main receptionist menu loop.
     * Mirrors: sidebar navigation in receptionist/layout.tsx
     */
    public void run() {
        while (true) {
            ConsoleUI.printMenu(
                "Receptionist — " + session.getUser().getName(),
                "Dashboard",
                "Appointment Requests",
                "All Appointments",
                "Logout"
            );

            int choice = ConsoleUI.readChoice("  Choose: ", 1, 4);

            try {
                switch (choice) {
                    case 1: showDashboard(); break;
                    case 2: showRequests(); break;
                    case 3: showScheduledAppointments(); break;
                    case 4: return;
                }
            } catch (SQLException e) {
                ConsoleUI.printError("Database error: " + e.getMessage());
                ConsoleUI.pressEnterToContinue();
            }
        }
    }

    /**
     * Receptionist dashboard with stats and recent requests.
     * Mirrors: receptionist/dashboard/page.tsx
     */
    private void showDashboard() throws SQLException {
        ConsoleUI.printHeader("Receptionist Dashboard");
        System.out.println("  Manage appointments and patient requests\n");

        // Stats
        ConsoleUI.printStat("Pending Requests", receptionistService.getPendingRequestCount());
        ConsoleUI.printStat("Today's Appointments", receptionistService.getTodayAppointmentCount());
        ConsoleUI.printStat("Completed This Week", receptionistService.getWeekCompletedCount());

        // Recent requests
        List<RequestedAppointment> recentRequests = receptionistService.getRecentRequests();
        ConsoleUI.printSubHeader("Recent Appointment Requests");
        if (recentRequests.isEmpty()) {
            ConsoleUI.printEmpty("No pending requests");
        } else {
            for (RequestedAppointment req : recentRequests) {
                System.out.println("  • " + req.getPatientName() + " → " +
                    req.getDoctorName() + " (" + req.getDoctorDepartment() + ")");
            }
        }

        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View and schedule pending appointment requests.
     * Mirrors: receptionist/requests/page.tsx
     */
    private void showRequests() throws SQLException {
        ConsoleUI.printHeader("Appointment Requests");

        List<RequestedAppointment> requests = receptionistService.getAllRequests();
        if (requests.isEmpty()) {
            ConsoleUI.printEmpty("No pending requests");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        System.out.println("  #   Patient              Phone           Blood   Doctor               Department");
        ConsoleUI.printDivider();
        for (int i = 0; i < requests.size(); i++) {
            RequestedAppointment req = requests.get(i);
            System.out.printf("  %-3d %-20s %-15s %-7s %-20s %s%n",
                (i + 1), req.getPatientName(), req.getPatientPhone(),
                req.getPatientBloodGroup(), req.getDoctorName(), req.getDoctorDepartment());
        }

        System.out.println("\n  Enter request number to schedule, 0 to go back:");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, requests.size());
        if (choice == 0) return;

        // Schedule the selected request using the Facade
        doScheduleAppointment(requests.get(choice - 1));
    }

    /**
     * Schedule an appointment using the Facade pattern.
     * 
     * Design Pattern: Facade — AppointmentSchedulingFacade hides complexity of
     * validation, conflict detection, ID generation, and multi-table operations.
     * 
     * Mirrors: the scheduling modal in receptionist/requests/page.tsx
     */
    private void doScheduleAppointment(RequestedAppointment request) {
        ConsoleUI.printSubHeader("Schedule — " + request.getPatientName() + " with " + request.getDoctorName());

        LocalDate date = ConsoleUI.readDate("  Appointment Date");
        LocalTime startTime = ConsoleUI.readTime("  Start Time");
        LocalTime endTime = ConsoleUI.readTime("  End Time");

        System.out.println("\n  Scheduling...");

        // Facade handles all complexity: validation, conflict check, ID gen, insert, delete
        String error = schedulingFacade.scheduleAppointment(
            request.getPId(), request.getDId(), date, startTime, endTime
        );

        if (error != null) {
            ToastManager.showToast(error, ToastType.ERROR);
        } else {
            ToastManager.showToast("Appointment scheduled for " + request.getPatientName() +
                " with " + request.getDoctorName(), ToastType.SUCCESS);
        }
        ConsoleUI.pressEnterToContinue();
    }

    /**
     * View all scheduled appointments with filtering and cancellation.
     * Mirrors: receptionist/scheduled/page.tsx
     */
    private void showScheduledAppointments() throws SQLException {
        ConsoleUI.printHeader("All Appointments");

        List<ScheduledAppointment> allAppointments = receptionistService.getAllAppointments();
        if (allAppointments.isEmpty()) {
            ConsoleUI.printEmpty("No appointments found");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Filter options
        System.out.println("  Filter by status:");
        System.out.println("  [1] All  [2] Scheduled  [3] Completed  [4] Cancelled");
        int statusChoice = ConsoleUI.readChoice("  Status filter: ", 1, 4);
        String statusFilter = switch (statusChoice) {
            case 2 -> "Scheduled";
            case 3 -> "Completed";
            case 4 -> "Cancelled";
            default -> "All";
        };

        String dateFilter = ConsoleUI.readLine("Date filter (YYYY-MM-DD, or press Enter for all): ");

        List<ScheduledAppointment> filtered = receptionistService.filterAppointments(
            allAppointments, statusFilter, dateFilter
        );

        if (filtered.isEmpty()) {
            ConsoleUI.printEmpty("No appointments match your filters");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        System.out.println("\n  #   ID     Patient              Doctor               Date            Time              Status");
        ConsoleUI.printDivider();
        for (int i = 0; i < filtered.size(); i++) {
            ScheduledAppointment apt = filtered.get(i);
            System.out.printf("  %-3d %-6s %-20s %-20s %-15s %-17s %s%n",
                (i + 1), apt.getAId(), apt.getPatientName(), apt.getDoctorName(),
                ConsoleUI.formatDate(apt.getDate()),
                ConsoleUI.formatTime(apt.getStartTime()) + "-" + ConsoleUI.formatTime(apt.getEndTime()),
                apt.getStatus().getValue());
        }

        System.out.println("\n  Enter appointment number to cancel (scheduled only), 0 to go back:");
        int choice = ConsoleUI.readChoice("  Choose: ", 0, filtered.size());
        if (choice == 0) return;

        ScheduledAppointment selected = filtered.get(choice - 1);
        if (selected.getStatus() != AppointmentStatus.SCHEDULED) {
            ConsoleUI.printError("Only scheduled appointments can be cancelled");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        // Confirmation dialog — mirrors ConfirmDialog component
        System.out.println("\n  ⚠ Cancel appointment for " + selected.getPatientName() +
            " with " + selected.getDoctorName() + "?");
        String confirm = ConsoleUI.readLine("Type 'yes' to confirm: ");
        if (!confirm.equalsIgnoreCase("yes")) {
            System.out.println("  Cancelled.");
            ConsoleUI.pressEnterToContinue();
            return;
        }

        String error = receptionistService.cancelAppointment(selected.getAId());
        if (error != null) {
            ToastManager.showToast(error, ToastType.ERROR);
        } else {
            ToastManager.showToast("Appointment cancelled successfully", ToastType.SUCCESS);
        }
        ConsoleUI.pressEnterToContinue();
    }
}
