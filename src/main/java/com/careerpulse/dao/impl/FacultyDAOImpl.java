package com.careerpulse.dao.impl;

import com.careerpulse.dao.FacultyDAO;
import com.careerpulse.model.Faculty;
import com.careerpulse.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class FacultyDAOImpl implements FacultyDAO {

    @Override
    public Optional<Faculty> findByUserId(int userId) throws SQLException {
        String sql = "SELECT f.*, u.email, u.role, u.is_active FROM faculty f JOIN users u ON f.user_id = u.id WHERE f.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToFaculty(rs));
                }
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Faculty> findAll() throws SQLException {
        List<Faculty> facultyList = new ArrayList<>();
        String sql = "SELECT f.*, u.email, u.role, u.is_active FROM faculty f JOIN users u ON f.user_id = u.id";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                facultyList.add(mapResultSetToFaculty(rs));
            }
        }
        return facultyList;
    }

    @Override
    public boolean createFaculty(Faculty faculty) throws SQLException {
        String sql = "INSERT INTO faculty (user_id, first_name, last_name, department_id, phone) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, faculty.getId());
            stmt.setString(2, faculty.getFirstName());
            stmt.setString(3, faculty.getLastName());
            if (faculty.getDepartmentId() > 0) {
                stmt.setInt(4, faculty.getDepartmentId());
            } else {
                stmt.setNull(4, Types.INTEGER);
            }
            stmt.setString(5, faculty.getPhone());
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateFaculty(Faculty faculty) throws SQLException {
        String sql = "UPDATE faculty SET first_name=?, last_name=?, department_id=?, phone=? WHERE user_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, faculty.getFirstName());
            stmt.setString(2, faculty.getLastName());
            if (faculty.getDepartmentId() > 0) {
                stmt.setInt(3, faculty.getDepartmentId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            stmt.setString(4, faculty.getPhone());
            stmt.setInt(5, faculty.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    private Faculty mapResultSetToFaculty(ResultSet rs) throws SQLException {
        Faculty f = new Faculty();
        f.setId(rs.getInt("user_id"));
        f.setEmail(rs.getString("email"));
        f.setRole(rs.getString("role"));
        f.setActive(rs.getBoolean("is_active"));
        f.setFirstName(rs.getString("first_name"));
        f.setLastName(rs.getString("last_name"));
        f.setDepartmentId(rs.getInt("department_id"));
        f.setPhone(rs.getString("phone"));
        return f;
    }
}
