package com.medica.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton database connection manager.
 * 
 * Design Pattern: Singleton (Creational)
 * Mirrors: lib/supabaseClient.ts — export const supabase = createClient(...)
 * 
 * The Supabase client in TypeScript is instantiated exactly once and exported
 * as a module-level constant. This Java Singleton achieves the same — one JDBC
 * connection instance shared across the entire application.
 * 
 * Java Equivalent of:
 *   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 */
public class SupabaseClient {
    private static SupabaseClient instance;
    private Connection connection;

    /**
     * Private constructor — prevents external instantiation (Singleton).
     */
    private SupabaseClient() {
        try {
            String url = DatabaseConfig.getDbUrl();
            String user = DatabaseConfig.getDbUser();
            String password = DatabaseConfig.getDbPassword();

            if (url.isEmpty() || user.isEmpty()) {
                System.err.println("⚠ Database configuration is incomplete.");
                System.err.println("  Please configure config.properties with your Supabase credentials.");
                return;
            }

            this.connection = DriverManager.getConnection(url, user, password);
            System.out.println("✓ Connected to Supabase PostgreSQL database");
        } catch (SQLException e) {
            System.err.println("✗ Failed to connect to database: " + e.getMessage());
        }
    }

    /**
     * Returns the single instance of SupabaseClient.
     * Thread-safe with synchronized keyword.
     */
    public static synchronized SupabaseClient getInstance() {
        if (instance == null) {
            instance = new SupabaseClient();
        }
        return instance;
    }

    /**
     * Returns the active JDBC connection.
     */
    public Connection getConnection() {
        return connection;
    }

    /**
     * Checks if the database connection is active and valid.
     */
    public boolean isConnected() {
        try {
            return connection != null && !connection.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    /**
     * Closes the database connection gracefully.
     */
    public void close() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("✓ Database connection closed");
            }
        } catch (SQLException e) {
            System.err.println("✗ Error closing database connection: " + e.getMessage());
        }
    }
}
