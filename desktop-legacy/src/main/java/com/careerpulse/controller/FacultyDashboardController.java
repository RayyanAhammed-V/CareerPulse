package com.careerpulse.controller;

import com.careerpulse.dao.StudentDAO;
import com.careerpulse.dao.impl.StudentDAOImpl;
import com.careerpulse.model.Student;
import com.careerpulse.util.SceneManager;
import com.careerpulse.util.SessionManager;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;

import java.util.List;

public class FacultyDashboardController {

    @FXML private Label totalStudentsLabel;
    @FXML private Label avgScoreLabel;
    @FXML private Label readyLabel;
    
    @FXML private TableView<Student> studentTable;
    @FXML private TableColumn<Student, String> regCol;
    @FXML private TableColumn<Student, String> nameCol;
    @FXML private TableColumn<Student, String> scoreCol;

    private final StudentDAO studentDAO = new StudentDAOImpl();

    @FXML
    public void initialize() {
        if (SessionManager.getCurrentUser() != null) {
            setupTable();
            loadData();
        }
    }

    private void setupTable() {
        regCol.setCellValueFactory(cellData -> new SimpleStringProperty(cellData.getValue().getRegisterNumber()));
        nameCol.setCellValueFactory(cellData -> new SimpleStringProperty(
                cellData.getValue().getFirstName() + " " + cellData.getValue().getLastName()
        ));
        scoreCol.setCellValueFactory(cellData -> new SimpleStringProperty(String.valueOf(cellData.getValue().getEmployabilityScore())));
    }

    private void loadData() {
        Task<List<Student>> loadTask = new Task<>() {
            @Override
            protected List<Student> call() throws Exception {
                return studentDAO.findAll();
            }
        };

        loadTask.setOnSucceeded(e -> {
            List<Student> students = loadTask.getValue();
            ObservableList<Student> data = FXCollections.observableArrayList(students);
            studentTable.setItems(data);
            
            totalStudentsLabel.setText(String.valueOf(students.size()));
            
            double avg = students.stream().mapToInt(Student::getEmployabilityScore).average().orElse(0.0);
            avgScoreLabel.setText(String.format("%.1f", avg));
            
            long readyCount = students.stream().filter(s -> s.getEmployabilityScore() >= 60).count();
            readyLabel.setText(String.valueOf(readyCount));
        });

        loadTask.setOnFailed(e -> {
            System.err.println("Failed to load students.");
        });

        new Thread(loadTask).start();
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        SceneManager.switchScene("/fxml/login.fxml", "Login");
    }
}
