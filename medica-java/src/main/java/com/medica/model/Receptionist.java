package com.medica.model;

/**
 * Represents a receptionist entity from the 'receptionist' table.
 * 
 * OOP Concept: Encapsulation — all fields private with controlled access.
 */
public class Receptionist {
    private String rId;
    private String name;
    private String email;
    private String password; // bcrypt hashed
    private String phone;

    public Receptionist() {}

    public Receptionist(String rId, String name, String email, String password, String phone) {
        this.rId = rId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    // Getters
    public String getRId() { return rId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhone() { return phone; }

    // Setters
    public void setRId(String rId) { this.rId = rId; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPhone(String phone) { this.phone = phone; }

    @Override
    public String toString() {
        return name + " (ID: " + rId + ")";
    }
}
