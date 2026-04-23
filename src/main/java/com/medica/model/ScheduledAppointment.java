package com.medica.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduledAppointment {
    private String aId;
    private String pId;
    private String dId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String patientName;
    private int patientAge;
    private String patientBloodGroup;
    private String doctorName;
    private String doctorDepartment;

    public ScheduledAppointment() {}

    @JsonProperty("aId") public String getAId() { return aId; }
    @JsonProperty("pId") public String getPId() { return pId; }
    @JsonProperty("dId") public String getDId() { return dId; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public AppointmentStatus getStatus() { return status; }
    public String getPatientName() { return patientName; }
    public int getPatientAge() { return patientAge; }
    public String getPatientBloodGroup() { return patientBloodGroup; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorDepartment() { return doctorDepartment; }

    public void setAId(String aId) { this.aId = aId; }
    public void setPId(String pId) { this.pId = pId; }
    public void setDId(String dId) { this.dId = dId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setPatientAge(int patientAge) { this.patientAge = patientAge; }
    public void setPatientBloodGroup(String patientBloodGroup) { this.patientBloodGroup = patientBloodGroup; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorDepartment(String doctorDepartment) { this.doctorDepartment = doctorDepartment; }
}
