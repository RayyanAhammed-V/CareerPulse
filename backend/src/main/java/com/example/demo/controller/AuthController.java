package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${frontend.url}")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String hashedInput = hashPassword(request.getPassword());
                
                if (user.getPasswordHash().equals(hashedInput)) {
                    // Quick and dirty JSON response for MVP
                    return ResponseEntity.ok(user);
                }
            }
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error");
        }
    }

    private String hashPassword(String password) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(password.getBytes("UTF-8"));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
