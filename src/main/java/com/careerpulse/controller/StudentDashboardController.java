package com.careerpulse.controller;

import com.careerpulse.util.SceneManager;
import com.careerpulse.util.SessionManager;
import javafx.fxml.FXML;
import javafx.scene.control.Label;

public class StudentDashboardController {

    @FXML private Label scoreLabel;
    @FXML private Label readinessLabel;

    @FXML
    public void initialize() {
        if (SessionManager.getCurrentUser() != null) {
            System.out.println("Welcome, " + SessionManager.getCurrentUser().getEmail());
            // Here we would load the student details and update the UI
        }
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        SceneManager.switchScene("/fxml/login.fxml", "Login");
    }
}
