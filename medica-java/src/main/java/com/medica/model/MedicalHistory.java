package com.medica.model;

import java.time.LocalDate;

/**
 * Represents a medical history record from the 'medical_history' table.
 * 
 * TypeScript equivalent: MedicalHistoryRecord interface
 */
public class MedicalHistory {
    private String pId;
    private String dId;
    private LocalDate date;
    private String healthCondition;
    private String treatment;
    private ConditionType type;

    // Joined data for display
    private String doctorName;
    private String doctorDepartment;

    public MedicalHistory() {}

    public MedicalHistory(String pId, String dId, LocalDate date, 
                          String healthCondition, String treatment, ConditionType type) {
        this.pId = pId;
        this.dId = dId;
        this.date = date;
        this.healthCondition = healthCondition;
        this.treatment = treatment;
        this.type = type;
    }

    // Core getters
    public String getPId() { return pId; }
    public String getDId() { return dId; }
    public LocalDate getDate() { return date; }
    public String getHealthCondition() { return healthCondition; }
    public String getTreatment() { return treatment; }
    public ConditionType getType() { return type; }

    // Joined data getters
    public String getDoctorName() { return doctorName; }
    public String getDoctorDepartment() { return doctorDepartment; }

    // Core setters
    public void setPId(String pId) { this.pId = pId; }
    public void setDId(String dId) { this.dId = dId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setHealthCondition(String healthCondition) { this.healthCondition = healthCondition; }
    public void setTreatment(String treatment) { this.treatment = treatment; }
    public void setType(ConditionType type) { this.type = type; }

    // Joined data setters
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setDoctorDepartment(String doctorDepartment) { this.doctorDepartment = doctorDepartment; }

    @Override
    public String toString() {
        return date + " | " + healthCondition + " | " + type.getValue() + " | Dr. " + doctorName;
    }
}
