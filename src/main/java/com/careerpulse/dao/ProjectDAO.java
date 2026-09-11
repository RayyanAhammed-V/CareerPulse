package com.careerpulse.dao;

import com.careerpulse.model.Project;
import java.sql.SQLException;
import java.util.List;

public interface ProjectDAO {
    List<Project> findByStudentId(int studentId) throws SQLException;
    boolean createProject(Project project) throws SQLException;
    boolean updateProject(Project project) throws SQLException;
    boolean deleteProject(int projectId) throws SQLException;
}
