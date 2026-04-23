package com.medica.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RequestedAppointment {
    private String pId;
    private String dId;
    private String patientName;
    private String patientPhone;
    private String patientBloodGroup;
    private String doctorName;
    private String doctorDepartment;

    public RequestedAppointment() {}
    public RequestedAppointment(String pId, String dId) { this.pId = pId; this.dId = dId; }

    @JsonProperty("pId") public String getPId() { return pId; }
    @JsonProperty("dId") public String getDId() { return dId; }
    public String getPatientName() { return patientName; }
    public String getPatientPhone() { return patientPhone; }
    public String getPatientBloodGroup() { return patientBloodGroup; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorDepartment() { return doctorDepartment; }

    public void setPId(String pId) { this.pId = pId; }
    public void setDId(String dId) { this.dId = dId; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    public void setPatientBloodGroup(String patientBloodGroup) { this.patientBloodGroup = patientBloodGroup; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorDepartment(String doctorDepartment) { this.doctorDepartment = doctorDepartment; }
}
