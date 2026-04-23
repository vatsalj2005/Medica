package com.medica.model;

/**
 * Represents an authenticated user's core identity data.
 * Encapsulates id, name, and email — consumers cannot access internal fields directly.
 * 
 * TypeScript equivalent: interface AuthUser { id: string; name: string; email: string; }
 * 
 * OOP Concept: Encapsulation — bundles user identity data together.
 */
public class AuthUser {
    private final String id;
    private final String name;
    private final String email;

    public AuthUser(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    /**
     * Returns the user's initials (first letter of each word).
     * Mirrors the getInitials() utility used across TS components.
     */
    public String getInitials() {
        StringBuilder initials = new StringBuilder();
        for (String part : name.split(" ")) {
            if (!part.isEmpty()) {
                initials.append(Character.toUpperCase(part.charAt(0)));
            }
        }
        return initials.length() > 2 ? initials.substring(0, 2) : initials.toString();
    }

    @Override
    public String toString() {
        return name + " (" + id + ")";
    }
}
