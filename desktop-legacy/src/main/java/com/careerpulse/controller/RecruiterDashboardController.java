package com.careerpulse.controller;

import com.careerpulse.dao.StudentDAO;
import com.careerpulse.dao.impl.StudentDAOImpl;
import com.careerpulse.model.Student;
import com.careerpulse.util.SceneManager;
import com.careerpulse.util.SessionManager;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;

import java.util.List;

public class RecruiterDashboardController {

    @FXML private TextField searchField;
    @FXML private TableView<Student> candidateTable;
    @FXML private TableColumn<Student, String> nameCol;
    @FXML private TableColumn<Student, String> scoreCol;
    @FXML private TableColumn<Student, Void> actionCol;

    private final StudentDAO studentDAO = new StudentDAOImpl();

    @FXML
    public void initialize() {
        if (SessionManager.getCurrentUser() != null) {
            setupTable();
            loadAllCandidates();
        }
    }

    private void setupTable() {
        nameCol.setCellValueFactory(cellData -> new SimpleStringProperty(
                cellData.getValue().getFirstName() + " " + cellData.getValue().getLastName()
        ));
        scoreCol.setCellValueFactory(cellData -> new SimpleStringProperty(String.valueOf(cellData.getValue().getEmployabilityScore())));

        actionCol.setCellFactory(col -> new TableCell<>() {
            private final Button shortlistBtn = new Button("Shortlist");

            {
                shortlistBtn.getStyleClass().add("primary-button");
                shortlistBtn.setOnAction(e -> {
                    Student student = getTableView().getItems().get(getIndex());
                    // Here we will add to shortlist table
                    System.out.println("Shortlisted: " + student.getFirstName());
                    shortlistBtn.setText("Added");
                    shortlistBtn.setDisable(true);
                });
            }

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    setGraphic(shortlistBtn);
                }
            }
        });
    }

    private void loadAllCandidates() {
        Task<List<Student>> loadTask = new Task<>() {
            @Override
            protected List<Student> call() throws Exception {
                return studentDAO.findAll();
            }
        };

        loadTask.setOnSucceeded(e -> {
            ObservableList<Student> data = FXCollections.observableArrayList(loadTask.getValue());
            candidateTable.setItems(data);
        });

        new Thread(loadTask).start();
    }

    @FXML
    private void handleSearch() {
        String query = searchField.getText().toLowerCase();
        // In a real app, we'd search via SQL. Here we can just filter the existing list for simplicity
        // or re-fetch. Since this is an MVP, we will rely on full load and filter.
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        SceneManager.switchScene("/fxml/login.fxml", "Login");
    }
}
