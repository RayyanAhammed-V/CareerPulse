package com.careerpulse.dao;

import com.careerpulse.model.Faculty;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface FacultyDAO {
    Optional<Faculty> findByUserId(int userId) throws SQLException;
    List<Faculty> findAll() throws SQLException;
    boolean createFaculty(Faculty faculty) throws SQLException;
    boolean updateFaculty(Faculty faculty) throws SQLException;
}
