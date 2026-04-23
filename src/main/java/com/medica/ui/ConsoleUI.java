package com.medica.ui;

import com.medica.observer.Observer;
import com.medica.observer.ToastType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Scanner;

/**
 * Shared console UI utilities for formatted output.
 * Also acts as an Observer for toast notifications — prints them to console.
 * 
 * Design Pattern: Observer — implements Observer to receive toast notifications.
 * Mirrors: The React component rendering in ToastContext.tsx
 */
public class ConsoleUI implements Observer {

    private static final Scanner scanner = new Scanner(System.in);
    private static final String DIVIDER = "─".repeat(70);
    private static final String DOUBLE_DIVIDER = "═".repeat(70);

    /**
     * Observer callback — prints toast notifications to console.
     */
    @Override
    public void update(String message, ToastType type) {
        System.out.println("\n  " + type.getIcon() + " [" + type.getLabel() + "] " + message);
    }

    // ─── Input Utilities ───────────────────────────────────────────────

    public static String readLine(String prompt) {
        System.out.print("  " + prompt);
        return scanner.nextLine().trim();
    }

    public static int readInt(String prompt) {
        while (true) {
            try {
                String input = readLine(prompt);
                return Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.println("  ✗ Please enter a valid number.");
            }
        }
    }

    public static int readChoice(String prompt, int min, int max) {
        while (true) {
            int choice = readInt(prompt);
            if (choice >= min && choice <= max) return choice;
            System.out.println("  ✗ Please enter a number between " + min + " and " + max + ".");
        }
    }

    public static LocalDate readDate(String prompt) {
        while (true) {
            String input = readLine(prompt + " (YYYY-MM-DD): ");
            try {
                return LocalDate.parse(input);
            } catch (DateTimeParseException e) {
                System.out.println("  ✗ Invalid date format. Use YYYY-MM-DD.");
            }
        }
    }

    public static LocalTime readTime(String prompt) {
        while (true) {
            String input = readLine(prompt + " (HH:MM): ");
            try {
                return LocalTime.parse(input, DateTimeFormatter.ofPattern("HH:mm"));
            } catch (DateTimeParseException e) {
                System.out.println("  ✗ Invalid time format. Use HH:MM (24-hour).");
            }
        }
    }

    public static String readPassword(String prompt) {
        // Console.readPassword() doesn't work in all environments
        return readLine(prompt);
    }

    // ─── Display Utilities ─────────────────────────────────────────────

    public static void printHeader(String title) {
        System.out.println();
        System.out.println("  " + DOUBLE_DIVIDER);
        System.out.println("  " + centerText(title, 70));
        System.out.println("  " + DOUBLE_DIVIDER);
    }

    public static void printSubHeader(String title) {
        System.out.println();
        System.out.println("  " + DIVIDER);
        System.out.println("  " + title);
        System.out.println("  " + DIVIDER);
    }

    public static void printDivider() {
        System.out.println("  " + DIVIDER);
    }

    public static void printMenu(String title, String... options) {
        printSubHeader(title);
        for (int i = 0; i < options.length; i++) {
            System.out.println("  [" + (i + 1) + "] " + options[i]);
        }
        System.out.println();
    }

    public static void printStat(String label, Object value) {
        System.out.printf("  %-30s %s%n", label + ":", value);
    }

    public static void printEmpty(String message) {
        System.out.println("\n  (No data) " + message + "\n");
    }

    public static void printError(String message) {
        System.out.println("  ✗ " + message);
    }

    public static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    /**
     * Print a formatted table row.
     */
    public static void printTableRow(String... cells) {
        StringBuilder sb = new StringBuilder("  ");
        for (String cell : cells) {
            sb.append(String.format("%-20s", cell != null ? truncate(cell, 18) : ""));
        }
        System.out.println(sb.toString());
    }

    /**
     * Print table header with underline.
     */
    public static void printTableHeader(String... headers) {
        printTableRow(headers);
        StringBuilder sb = new StringBuilder("  ");
        for (int i = 0; i < headers.length; i++) {
            sb.append("─".repeat(18)).append("  ");
        }
        System.out.println(sb.toString());
    }

    public static void pressEnterToContinue() {
        System.out.print("\n  Press Enter to continue...");
        scanner.nextLine();
    }

    public static void clearScreen() {
        System.out.print("\033[H\033[2J");
        System.out.flush();
    }

    // ─── Formatting Helpers ────────────────────────────────────────────

    /**
     * Get time-of-day greeting.
     * Mirrors: greeting logic in dashboard pages
     */
    public static String getGreeting() {
        int hour = LocalTime.now().getHour();
        if (hour < 12) return "Good morning";
        else if (hour < 18) return "Good afternoon";
        else return "Good evening";
    }

    /**
     * Format a date for display.
     * Mirrors: formatDate() in TS components
     */
    public static String formatDate(LocalDate date) {
        if (date == null) return "N/A";
        return date.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    /**
     * Format a time for display.
     */
    public static String formatTime(LocalTime time) {
        if (time == null) return "N/A";
        return time.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private static String truncate(String text, int maxLen) {
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen - 2) + "..";
    }

    private static String centerText(String text, int width) {
        if (text.length() >= width) return text;
        int padding = (width - text.length()) / 2;
        return " ".repeat(padding) + text + " ".repeat(width - text.length() - padding);
    }
}
