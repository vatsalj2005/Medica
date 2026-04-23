package com.medica.model;

/**
 * Represents an active user session containing the role and user data.
 * 
 * TypeScript equivalent: interface AuthSession { role: UserRole; user: AuthUser; }
 * 
 * OOP Concept: Encapsulation — bundles role and user identity together.
 */
public class AuthSession {
    private final UserRole role;
    private final AuthUser user;

    public AuthSession(UserRole role, AuthUser user) {
        this.role = role;
        this.user = user;
    }

    public UserRole getRole() { return role; }
    public AuthUser getUser() { return user; }

    @Override
    public String toString() {
        return role.getValue() + " — " + user.toString();
    }
}
