package com.careerpulse.controller;

import com.careerpulse.model.User;
import com.careerpulse.service.AuthenticationService;
import com.careerpulse.util.SceneManager;
import com.careerpulse.util.SessionManager;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

public class LoginController {

    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;

    private AuthenticationService authService;

    @FXML
    public void initialize() {
        authService = new AuthenticationService();
    }

    @FXML
    private void handleLogin() {
        String email = emailField.getText().trim();
        String password = passwordField.getText();

        if (email.isEmpty() || password.isEmpty()) {
            showError("Please enter both email and password.");
            return;
        }

        // Use a Task so UI doesn't freeze during database operations
        Task<User> loginTask = new Task<>() {
            @Override
            protected User call() throws Exception {
                return authService.login(email, password);
            }
        };

        loginTask.setOnSucceeded(e -> {
            User user = loginTask.getValue();
            SessionManager.setCurrentUser(user);
            routeToDashboard(user.getRole());
        });

        loginTask.setOnFailed(e -> {
            Throwable ex = loginTask.getException();
            showError(ex.getMessage() != null ? ex.getMessage() : "Database connection error.");
        });

        new Thread(loginTask).start();
    }

    @FXML
    private void handleRegister() {
        // SceneManager.switchScene("/fxml/register.fxml", "Register");
        System.out.println("Navigate to Register");
    }

    private void showError(String message) {
        Platform.runLater(() -> {
            errorLabel.setText(message);
            errorLabel.setVisible(true);
            errorLabel.setManaged(true);
        });
    }

    private void routeToDashboard(String role) {
        Platform.runLater(() -> {
            switch (role) {
                case "STUDENT":
                    SceneManager.switchScene("/fxml/student_dashboard.fxml", "Student Dashboard");
                    break;
                case "FACULTY":
                    SceneManager.switchScene("/fxml/faculty_dashboard.fxml", "Faculty Dashboard");
                    break;
                case "RECRUITER":
                    SceneManager.switchScene("/fxml/recruiter_dashboard.fxml", "Recruiter Dashboard");
                    break;
                case "ADMIN":
                    SceneManager.switchScene("/fxml/admin_dashboard.fxml", "Admin Dashboard");
                    break;
                default:
                    showError("Invalid role.");
            }
        });
    }
}
