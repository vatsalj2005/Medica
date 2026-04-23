package com.medica.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Patient {
    private String pId;
    private String name;
    private int age;
    private String bloodGroup;
    private String gender;
    private String email;
    private String phone;
    private String password;

    public Patient() {}

    @JsonProperty("pId") public String getPId() { return pId; }
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getBloodGroup() { return bloodGroup; }
    public String getGender() { return gender; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getPassword() { return password; }

    public void setPId(String pId) { this.pId = pId; }
    public void setName(String name) { this.name = name; }
    public void setAge(int age) { this.age = age; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public void setGender(String gender) { this.gender = gender; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPassword(String password) { this.password = password; }
}
