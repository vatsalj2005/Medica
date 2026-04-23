package com.medica.model;

/**
 * Represents a patient entity from the 'patient' table.
 * 
 * OOP Concept: Encapsulation — all fields private with controlled access.
 * OOP Concept: Abstraction — hides internal data representation.
 */
public class Patient {
    private String pId;
    private String name;
    private int age;
    private String bloodGroup;
    private String gender;
    private String email;
    private String phone;
    private String password; // bcrypt hashed

    public Patient() {}

    public Patient(String pId, String name, int age, String bloodGroup, 
                   String gender, String email, String phone, String password) {
        this.pId = pId;
        this.name = name;
        this.age = age;
        this.bloodGroup = bloodGroup;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.password = password;
    }

    // Getters
    public String getPId() { return pId; }
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getBloodGroup() { return bloodGroup; }
    public String getGender() { return gender; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getPassword() { return password; }

    // Setters
    public void setPId(String pId) { this.pId = pId; }
    public void setName(String name) { this.name = name; }
    public void setAge(int age) { this.age = age; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public void setGender(String gender) { this.gender = gender; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPassword(String password) { this.password = password; }

    @Override
    public String toString() {
        return name + " (ID: " + pId + ", Age: " + age + ", Blood: " + bloodGroup + ")";
    }
}
