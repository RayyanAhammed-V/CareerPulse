package com.careerpulse.dao.impl;

import com.careerpulse.dao.StudentDAO;
import com.careerpulse.model.Student;
import com.careerpulse.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StudentDAOImpl implements StudentDAO {

    @Override
    public Optional<Student> findByUserId(int userId) throws SQLException {
        String sql = "SELECT s.*, u.email, u.role, u.is_active FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToStudent(rs));
                }
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<Student> findByRegisterNumber(String registerNumber) throws SQLException {
        String sql = "SELECT s.*, u.email, u.role, u.is_active FROM students s JOIN users u ON s.user_id = u.id WHERE s.register_number = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, registerNumber);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToStudent(rs));
                }
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Student> findAll() throws SQLException {
        List<Student> students = new ArrayList<>();
        String sql = "SELECT s.*, u.email, u.role, u.is_active FROM students s JOIN users u ON s.user_id = u.id";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                students.add(mapResultSetToStudent(rs));
            }
        }
        return students;
    }

    @Override
    public boolean createStudent(Student student) throws SQLException {
        String sql = "INSERT INTO students (user_id, register_number, first_name, last_name, phone, date_of_birth, gender, address, college, university, department_id, semester, cgpa, backlogs, graduation_year, github_url, linkedin_url, portfolio_url, career_interest, preferred_job_role, about_me, employability_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            setStudentStatementParameters(stmt, student);
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateStudent(Student student) throws SQLException {
        String sql = "UPDATE students SET register_number=?, first_name=?, last_name=?, phone=?, date_of_birth=?, gender=?, address=?, college=?, university=?, department_id=?, semester=?, cgpa=?, backlogs=?, graduation_year=?, github_url=?, linkedin_url=?, portfolio_url=?, career_interest=?, preferred_job_role=?, about_me=?, employability_score=? WHERE user_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            setStudentStatementParameters(stmt, student);
            stmt.setInt(22, student.getId()); // ID is in User class (user_id)
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateEmployabilityScore(int studentId, int newScore) throws SQLException {
        String sql = "UPDATE students SET employability_score = ? WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newScore);
            stmt.setInt(2, studentId);
            return stmt.executeUpdate() > 0;
        }
    }

    private void setStudentStatementParameters(PreparedStatement stmt, Student student) throws SQLException {
        stmt.setInt(1, student.getId());
        stmt.setString(2, student.getRegisterNumber());
        stmt.setString(3, student.getFirstName());
        stmt.setString(4, student.getLastName());
        stmt.setString(5, student.getPhone());
        stmt.setDate(6, student.getDateOfBirth());
        stmt.setString(7, student.getGender());
        stmt.setString(8, student.getAddress());
        stmt.setString(9, student.getCollege());
        stmt.setString(10, student.getUniversity());
        if (student.getDepartmentId() > 0) {
            stmt.setInt(11, student.getDepartmentId());
        } else {
            stmt.setNull(11, Types.INTEGER);
        }
        stmt.setInt(12, student.getSemester());
        stmt.setDouble(13, student.getCgpa());
        stmt.setInt(14, student.getBacklogs());
        stmt.setInt(15, student.getGraduationYear());
        stmt.setString(16, student.getGithubUrl());
        stmt.setString(17, student.getLinkedinUrl());
        stmt.setString(18, student.getPortfolioUrl());
        stmt.setString(19, student.getCareerInterest());
        stmt.setString(20, student.getPreferredJobRole());
        stmt.setString(21, student.getAboutMe());
        stmt.setInt(22, student.getEmployabilityScore());
    }

    private Student mapResultSetToStudent(ResultSet rs) throws SQLException {
        Student student = new Student();
        student.setId(rs.getInt("user_id"));
        student.setEmail(rs.getString("email"));
        student.setRole(rs.getString("role"));
        student.setActive(rs.getBoolean("is_active"));
        
        student.setRegisterNumber(rs.getString("register_number"));
        student.setFirstName(rs.getString("first_name"));
        student.setLastName(rs.getString("last_name"));
        student.setPhone(rs.getString("phone"));
        student.setDateOfBirth(rs.getDate("date_of_birth"));
        student.setGender(rs.getString("gender"));
        student.setAddress(rs.getString("address"));
        student.setCollege(rs.getString("college"));
        student.setUniversity(rs.getString("university"));
        student.setDepartmentId(rs.getInt("department_id"));
        student.setSemester(rs.getInt("semester"));
        student.setCgpa(rs.getDouble("cgpa"));
        student.setBacklogs(rs.getInt("backlogs"));
        student.setGraduationYear(rs.getInt("graduation_year"));
        student.setGithubUrl(rs.getString("github_url"));
        student.setLinkedinUrl(rs.getString("linkedin_url"));
        student.setPortfolioUrl(rs.getString("portfolio_url"));
        student.setCareerInterest(rs.getString("career_interest"));
        student.setPreferredJobRole(rs.getString("preferred_job_role"));
        student.setAboutMe(rs.getString("about_me"));
        student.setEmployabilityScore(rs.getInt("employability_score"));
        return student;
    }
}
