package com.careerpulse.dao;

import com.careerpulse.model.Recruiter;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface RecruiterDAO {
    Optional<Recruiter> findByUserId(int userId) throws SQLException;
    List<Recruiter> findAll() throws SQLException;
    boolean createRecruiter(Recruiter recruiter) throws SQLException;
    boolean updateRecruiter(Recruiter recruiter) throws SQLException;
}
