package com.careerpulse.dao.impl;

import com.careerpulse.dao.AdminDAO;
import com.careerpulse.model.Admin;
import com.careerpulse.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class AdminDAOImpl implements AdminDAO {

    @Override
    public Optional<Admin> findByUserId(int userId) throws SQLException {
        String sql = "SELECT a.*, u.email, u.role, u.is_active FROM admins a JOIN users u ON a.user_id = u.id WHERE a.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Admin a = new Admin();
                    a.setId(rs.getInt("user_id"));
                    a.setEmail(rs.getString("email"));
                    a.setRole(rs.getString("role"));
                    a.setActive(rs.getBoolean("is_active"));
                    a.setFirstName(rs.getString("first_name"));
                    a.setLastName(rs.getString("last_name"));
                    a.setPhone(rs.getString("phone"));
                    return Optional.of(a);
                }
            }
        }
        return Optional.empty();
    }
}
