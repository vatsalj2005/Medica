package com.medica.db;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class DatabaseConfig {

    private static final Properties properties = new Properties();

    static {
        // 1. Try environment variables first (Oracle Cloud / production)
        String envUrl  = System.getenv("DB_URL");
        String envUser = System.getenv("DB_USER");
        String envPass = System.getenv("DB_PASSWORD");

        if (envUrl != null && !envUrl.isBlank()) {
            properties.setProperty("db.url",      envUrl);
            properties.setProperty("db.user",     envUser != null ? envUser : "");
            properties.setProperty("db.password", envPass != null ? envPass : "");
        } else {
            // 2. Fall back to config.properties (local development)
            try (InputStream input = new FileInputStream("config.properties")) {
                properties.load(input);
            } catch (IOException e) {
                System.err.println("⚠ Could not load config.properties and no DB_URL env var set.");
            }
        }
    }

    public static String getDbUrl()      { return properties.getProperty("db.url", ""); }
    public static String getDbUser()     { return properties.getProperty("db.user", ""); }
    public static String getDbPassword() { return properties.getProperty("db.password", ""); }
}
