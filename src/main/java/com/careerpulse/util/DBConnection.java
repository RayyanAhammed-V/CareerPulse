package com.careerpulse.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnection {

    private static final String PROPERTIES_FILE = "/database.properties";
    private static Properties properties = new Properties();

    static {
        try (InputStream is = DBConnection.class.getResourceAsStream(PROPERTIES_FILE)) {
            if (is != null) {
                properties.load(is);
                Class.forName("com.mysql.cj.jdbc.Driver");
            } else {
                System.err.println("Database properties file not found.");
            }
        } catch (Exception e) {
            System.err.println("Failed to load database properties or driver: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                properties.getProperty("db.url"),
                properties.getProperty("db.username"),
                properties.getProperty("db.password")
        );
    }
}
