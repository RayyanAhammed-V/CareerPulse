package com.careerpulse.app;

import com.careerpulse.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        SceneManager.setPrimaryStage(primaryStage);
        primaryStage.setMinWidth(800);
        primaryStage.setMinHeight(600);
        // Start with the Login Screen
        SceneManager.switchScene("/fxml/login.fxml", "Login");
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
