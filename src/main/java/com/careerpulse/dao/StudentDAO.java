package com.careerpulse.dao;

import com.careerpulse.model.Student;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface StudentDAO {
    Optional<Student> findByUserId(int userId) throws SQLException;
    Optional<Student> findByRegisterNumber(String registerNumber) throws SQLException;
    List<Student> findAll() throws SQLException;
    boolean createStudent(Student student) throws SQLException;
    boolean updateStudent(Student student) throws SQLException;
    boolean updateEmployabilityScore(int studentId, int newScore) throws SQLException;
}
