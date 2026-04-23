package com.medica.db;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads database configuration from config.properties.
 * 
 * Design Principle: Single Responsibility — only responsible for config loading.
 */
public class DatabaseConfig {
    private static final String CONFIG_FILE = "config.properties";
    private static Properties properties;

    static {
        properties = new Properties();
        try (InputStream input = new FileInputStream(CONFIG_FILE)) {
            properties.load(input);
        } catch (IOException e) {
            System.err.println("⚠ Could not load " + CONFIG_FILE);
            System.err.println("  Please copy config.properties.example to config.properties");
            System.err.println("  and fill in your Supabase PostgreSQL credentials.");
        }
    }

    public static String getDbUrl() {
        return properties.getProperty("db.url", "");
    }

    public static String getDbUser() {
        return properties.getProperty("db.user", "");
    }

    public static String getDbPassword() {
        return properties.getProperty("db.password", "");
    }
}
