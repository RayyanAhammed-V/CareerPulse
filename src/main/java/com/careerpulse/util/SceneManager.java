package com.careerpulse.util;

import com.careerpulse.app.Main;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;

public class SceneManager {

    private static Stage primaryStage;

    public static void setPrimaryStage(Stage stage) {
        primaryStage = stage;
    }

    public static void switchScene(String fxmlPath, String title) {
        try {
            URL resource = Main.class.getResource(fxmlPath);
            if (resource == null) {
                System.err.println("Cannot find FXML file: " + fxmlPath);
                return;
            }
            Parent root = FXMLLoader.load(resource);
            Scene scene = new Scene(root, 1024, 768);
            
            // Add global stylesheet
            URL cssResource = Main.class.getResource("/css/style.css");
            if (cssResource != null) {
                scene.getStylesheets().add(cssResource.toExternalForm());
            }

            primaryStage.setTitle("CareerPulse - " + title);
            primaryStage.setScene(scene);
            primaryStage.centerOnScreen();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
