package com.medica.model;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Represents a scheduled appointment from the 'scheduled_appointments' table.
 * Includes optional references to associated Patient and Doctor for display.
 * 
 * TypeScript equivalents: AppointmentWithDoctor, AppointmentWithPatient, AppointmentWithDetails
 */
public class ScheduledAppointment {
    private String aId;
    private String pId;
    private String dId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;

    // Joined data for display (not always populated)
    private String patientName;
    private int patientAge;
    private String patientBloodGroup;
    private String doctorName;
    private String doctorDepartment;

    public ScheduledAppointment() {}

    public ScheduledAppointment(String aId, String pId, String dId, 
                                 LocalDate date, LocalTime startTime, 
                                 LocalTime endTime, AppointmentStatus status) {
        this.aId = aId;
        this.pId = pId;
        this.dId = dId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    // Core getters
    public String getAId() { return aId; }
    public String getPId() { return pId; }
    public String getDId() { return dId; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public AppointmentStatus getStatus() { return status; }

    // Joined data getters
    public String getPatientName() { return patientName; }
    public int getPatientAge() { return patientAge; }
    public String getPatientBloodGroup() { return patientBloodGroup; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorDepartment() { return doctorDepartment; }

    // Core setters
    public void setAId(String aId) { this.aId = aId; }
    public void setPId(String pId) { this.pId = pId; }
    public void setDId(String dId) { this.dId = dId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    // Joined data setters
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setPatientAge(int patientAge) { this.patientAge = patientAge; }
    public void setPatientBloodGroup(String patientBloodGroup) { this.patientBloodGroup = patientBloodGroup; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorDepartment(String doctorDepartment) { this.doctorDepartment = doctorDepartment; }

    @Override
    public String toString() {
        return aId + " | " + date + " " + startTime + "-" + endTime + " | " + status.getValue();
    }
}
