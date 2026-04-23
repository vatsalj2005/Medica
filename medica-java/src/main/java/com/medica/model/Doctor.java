package com.medica.model;

/**
 * Represents a doctor entity from the 'doctor' table.
 * 
 * OOP Concept: Encapsulation — all fields private with controlled access.
 */
public class Doctor {
    private String dId;
    private String name;
    private String email;
    private String password; // bcrypt hashed
    private String department;
    private String phone;

    public Doctor() {}

    public Doctor(String dId, String name, String email, String password, 
                  String department, String phone) {
        this.dId = dId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.department = department;
        this.phone = phone;
    }

    // Getters
    public String getDId() { return dId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getDepartment() { return department; }
    public String getPhone() { return phone; }

    // Setters
    public void setDId(String dId) { this.dId = dId; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setDepartment(String department) { this.department = department; }
    public void setPhone(String phone) { this.phone = phone; }

    @Override
    public String toString() {
        return name + " (" + department + ", ID: " + dId + ")";
    }
}
