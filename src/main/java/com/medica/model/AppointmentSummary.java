package com.medica.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AppointmentSummary {
    private String aId;
    private String symptoms;
    private String diagnosis;
    private String prescription;

    public AppointmentSummary() {}
    public AppointmentSummary(String aId, String symptoms, String diagnosis, String prescription) {
        this.aId = aId; this.symptoms = symptoms; this.diagnosis = diagnosis; this.prescription = prescription;
    }

    @JsonProperty("aId") public String getAId() { return aId; }
    public String getSymptoms() { return symptoms; }
    public String getDiagnosis() { return diagnosis; }
    public String getPrescription() { return prescription; }

    public void setAId(String aId) { this.aId = aId; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public void setPrescription(String prescription) { this.prescription = prescription; }
}
