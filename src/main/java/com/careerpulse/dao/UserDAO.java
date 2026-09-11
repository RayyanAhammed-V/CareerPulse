package com.careerpulse.dao;

import com.careerpulse.model.User;
import java.sql.SQLException;
import java.util.Optional;

public interface UserDAO {
    Optional<User> findByEmail(String email) throws SQLException;
    Optional<User> findById(int id) throws SQLException;
    boolean createUser(User user) throws SQLException;
    boolean updateUser(User user) throws SQLException;
    boolean updatePassword(int userId, String newPasswordHash) throws SQLException;
}
