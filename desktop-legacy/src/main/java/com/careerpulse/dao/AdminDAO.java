package com.careerpulse.dao;

import com.careerpulse.model.Admin;
import java.sql.SQLException;
import java.util.Optional;

public interface AdminDAO {
    Optional<Admin> findByUserId(int userId) throws SQLException;
}
