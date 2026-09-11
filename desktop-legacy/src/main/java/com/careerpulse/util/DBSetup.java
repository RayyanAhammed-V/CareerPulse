package com.careerpulse.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.Statement;
import java.util.stream.Collectors;

public class DBSetup {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to Aiven Cloud Database!");

            // Run Schema
            System.out.println("Running schema.sql...");
            executeSqlFile(stmt, "/database/schema.sql");
            
            // Run Seed
            System.out.println("Running seed.sql...");
            executeSqlFile(stmt, "/database/seed.sql");

            System.out.println("Database setup complete!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void executeSqlFile(Statement stmt, String filePath) throws Exception {
        try (InputStream is = DBSetup.class.getResourceAsStream(filePath)) {
            if (is == null) throw new RuntimeException("File not found: " + filePath);
            
            String sql = new BufferedReader(new InputStreamReader(is))
                    .lines()
                    .collect(Collectors.joining("\n"));
            
            // Very basic split by semicolon, ignoring semicolons in strings.
            // For our simple scripts, splitting by ';\n' or similar should work.
            String[] commands = sql.split(";");
            for (String command : commands) {
                if (command.trim().isEmpty()) continue;
                stmt.execute(command);
            }
        }
    }
}
