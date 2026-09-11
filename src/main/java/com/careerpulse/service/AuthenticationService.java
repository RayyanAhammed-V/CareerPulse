package com.careerpulse.service;

import com.careerpulse.dao.UserDAO;
import com.careerpulse.dao.impl.UserDAOImpl;
import com.careerpulse.model.User;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.Optional;

public class AuthenticationService {

    private final UserDAO userDAO;

    public AuthenticationService() {
        this.userDAO = new UserDAOImpl();
    }

    public User login(String email, String plainPassword) throws Exception {
        Optional<User> optionalUser = userDAO.findByEmail(email);
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (!user.isActive()) {
                throw new Exception("Account is deactivated. Please contact administrator.");
            }
            
            String hashedInput = hashPassword(plainPassword);
            if (hashedInput.equals(user.getPasswordHash())) {
                return user; // Successful login
            } else {
                throw new Exception("Invalid email or password.");
            }
        }
        throw new Exception("Invalid email or password.");
    }

    public boolean registerUser(User user, String plainPassword) throws Exception {
        if (userDAO.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("Email already registered.");
        }
        user.setPasswordHash(hashPassword(plainPassword));
        user.setActive(true);
        return userDAO.createUser(user);
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
