package com.careerpulse.controller;

import com.careerpulse.util.SceneManager;
import com.careerpulse.util.SessionManager;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;

public class AdminDashboardController {

    @FXML private Label totalUsersLabel;
    @FXML private ListView<String> activityList;

    @FXML
    public void initialize() {
        if (SessionManager.getCurrentUser() != null) {
            // Mock data for MVP
            totalUsersLabel.setText("152");
            activityList.setItems(FXCollections.observableArrayList(
                "User student1@careerpulse.com logged in.",
                "Faculty John Doe generated department report.",
                "Admin updated scoring rules.",
                "Recruiter Tech Corp shortlisted Alice Johnson."
            ));
        }
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        SceneManager.switchScene("/fxml/login.fxml", "Login");
    }
}
