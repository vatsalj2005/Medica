package com.medica.model;

/**
 * Represents a requested appointment from the 'requested_appointment' table.
 * 
 * TypeScript equivalent: RequestWithDetails interface
 */
public class RequestedAppointment {
    private String pId;
    private String dId;

    // Joined data for display
    private String patientName;
    private String patientPhone;
    private String patientBloodGroup;
    private String doctorName;
    private String doctorDepartment;

    public RequestedAppointment() {}

    public RequestedAppointment(String pId, String dId) {
        this.pId = pId;
        this.dId = dId;
    }

    // Core getters
    public String getPId() { return pId; }
    public String getDId() { return dId; }

    // Joined data getters
    public String getPatientName() { return patientName; }
    public String getPatientPhone() { return patientPhone; }
    public String getPatientBloodGroup() { return patientBloodGroup; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorDepartment() { return doctorDepartment; }

    // Core setters
    public void setPId(String pId) { this.pId = pId; }
    public void setDId(String dId) { this.dId = dId; }

    // Joined data setters
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    public void setPatientBloodGroup(String patientBloodGroup) { this.patientBloodGroup = patientBloodGroup; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorDepartment(String doctorDepartment) { this.doctorDepartment = doctorDepartment; }

    @Override
    public String toString() {
        return patientName + " → " + doctorName + " (" + doctorDepartment + ")";
    }
}
