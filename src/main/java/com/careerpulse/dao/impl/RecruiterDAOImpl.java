package com.careerpulse.dao.impl;

import com.careerpulse.dao.RecruiterDAO;
import com.careerpulse.model.Recruiter;
import com.careerpulse.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RecruiterDAOImpl implements RecruiterDAO {

    @Override
    public Optional<Recruiter> findByUserId(int userId) throws SQLException {
        String sql = "SELECT r.*, u.email, u.role, u.is_active FROM recruiters r JOIN users u ON r.user_id = u.id WHERE r.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToRecruiter(rs));
                }
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Recruiter> findAll() throws SQLException {
        List<Recruiter> recruiters = new ArrayList<>();
        String sql = "SELECT r.*, u.email, u.role, u.is_active FROM recruiters r JOIN users u ON r.user_id = u.id";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                recruiters.add(mapResultSetToRecruiter(rs));
            }
        }
        return recruiters;
    }

    @Override
    public boolean createRecruiter(Recruiter recruiter) throws SQLException {
        String sql = "INSERT INTO recruiters (user_id, first_name, last_name, company_name, designation, phone) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, recruiter.getId());
            stmt.setString(2, recruiter.getFirstName());
            stmt.setString(3, recruiter.getLastName());
            stmt.setString(4, recruiter.getCompanyName());
            stmt.setString(5, recruiter.getDesignation());
            stmt.setString(6, recruiter.getPhone());
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateRecruiter(Recruiter recruiter) throws SQLException {
        String sql = "UPDATE recruiters SET first_name=?, last_name=?, company_name=?, designation=?, phone=? WHERE user_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, recruiter.getFirstName());
            stmt.setString(2, recruiter.getLastName());
            stmt.setString(3, recruiter.getCompanyName());
            stmt.setString(4, recruiter.getDesignation());
            stmt.setString(5, recruiter.getPhone());
            stmt.setInt(6, recruiter.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    private Recruiter mapResultSetToRecruiter(ResultSet rs) throws SQLException {
        Recruiter r = new Recruiter();
        r.setId(rs.getInt("user_id"));
        r.setEmail(rs.getString("email"));
        r.setRole(rs.getString("role"));
        r.setActive(rs.getBoolean("is_active"));
        r.setFirstName(rs.getString("first_name"));
        r.setLastName(rs.getString("last_name"));
        r.setCompanyName(rs.getString("company_name"));
        r.setDesignation(rs.getString("designation"));
        r.setPhone(rs.getString("phone"));
        return r;
    }
}
