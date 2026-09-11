package com.careerpulse.dao.impl;

import com.careerpulse.dao.ProjectDAO;
import com.careerpulse.model.Project;
import com.careerpulse.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProjectDAOImpl implements ProjectDAO {

    @Override
    public List<Project> findByStudentId(int studentId) throws SQLException {
        List<Project> projects = new ArrayList<>();
        String sql = "SELECT * FROM projects WHERE student_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    projects.add(mapResultSetToProject(rs));
                }
            }
        }
        return projects;
    }

    @Override
    public boolean createProject(Project project) throws SQLException {
        String sql = "INSERT INTO projects (student_id, title, description, project_type, technologies, start_date, end_date, team_size, student_role, github_url, demo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            setProjectParameters(stmt, project);
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        project.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    @Override
    public boolean updateProject(Project project) throws SQLException {
        String sql = "UPDATE projects SET title=?, description=?, project_type=?, technologies=?, start_date=?, end_date=?, team_size=?, student_role=?, github_url=?, demo_url=?, status=? WHERE id=? AND student_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, project.getTitle());
            stmt.setString(2, project.getDescription());
            stmt.setString(3, project.getProjectType());
            stmt.setString(4, project.getTechnologies());
            stmt.setDate(5, project.getStartDate());
            stmt.setDate(6, project.getEndDate());
            stmt.setInt(7, project.getTeamSize());
            stmt.setString(8, project.getStudentRole());
            stmt.setString(9, project.getGithubUrl());
            stmt.setString(10, project.getDemoUrl());
            stmt.setString(11, project.getStatus());
            stmt.setInt(12, project.getId());
            stmt.setInt(13, project.getStudentId());
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteProject(int projectId) throws SQLException {
        String sql = "DELETE FROM projects WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, projectId);
            return stmt.executeUpdate() > 0;
        }
    }

    private void setProjectParameters(PreparedStatement stmt, Project project) throws SQLException {
        stmt.setInt(1, project.getStudentId());
        stmt.setString(2, project.getTitle());
        stmt.setString(3, project.getDescription());
        stmt.setString(4, project.getProjectType());
        stmt.setString(5, project.getTechnologies());
        stmt.setDate(6, project.getStartDate());
        stmt.setDate(7, project.getEndDate());
        stmt.setInt(8, project.getTeamSize());
        stmt.setString(9, project.getStudentRole());
        stmt.setString(10, project.getGithubUrl());
        stmt.setString(11, project.getDemoUrl());
        stmt.setString(12, project.getStatus());
    }

    private Project mapResultSetToProject(ResultSet rs) throws SQLException {
        Project p = new Project();
        p.setId(rs.getInt("id"));
        p.setStudentId(rs.getInt("student_id"));
        p.setTitle(rs.getString("title"));
        p.setDescription(rs.getString("description"));
        p.setProjectType(rs.getString("project_type"));
        p.setTechnologies(rs.getString("technologies"));
        p.setStartDate(rs.getDate("start_date"));
        p.setEndDate(rs.getDate("end_date"));
        p.setTeamSize(rs.getInt("team_size"));
        p.setStudentRole(rs.getString("student_role"));
        p.setGithubUrl(rs.getString("github_url"));
        p.setDemoUrl(rs.getString("demo_url"));
        p.setStatus(rs.getString("status"));
        return p;
    }
}
