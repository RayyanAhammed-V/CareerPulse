$baseDir = "C:\Users\ZBOOK\.gemini\antigravity\scratch\careerpulse\src\main\java\com\careerpulse\model"
New-Item -ItemType Directory -Force -Path $baseDir

$userModel = "package com.careerpulse.model;

import java.sql.Timestamp;

public class User {
    private int id;
    private String email;
    private String passwordHash;
    private String role;
    private boolean isActive;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
"
Set-Content -Path "\User.java" -Value $userModel

$studentModel = "package com.careerpulse.model;

import java.sql.Date;

public class Student extends User {
    private String registerNumber;
    private String firstName;
    private String lastName;
    private String phone;
    private Date dateOfBirth;
    private String gender;
    private String address;
    private String college;
    private String university;
    private int departmentId;
    private int semester;
    private double cgpa;
    private int backlogs;
    private int graduationYear;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String careerInterest;
    private String preferredJobRole;
    private String aboutMe;
    private int employabilityScore;

    // Getters and Setters
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Date getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(Date dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    public int getBacklogs() { return backlogs; }
    public void setBacklogs(int backlogs) { this.backlogs = backlogs; }

    public int getGraduationYear() { return graduationYear; }
    public void setGraduationYear(int graduationYear) { this.graduationYear = graduationYear; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getCareerInterest() { return careerInterest; }
    public void setCareerInterest(String careerInterest) { this.careerInterest = careerInterest; }

    public String getPreferredJobRole() { return preferredJobRole; }
    public void setPreferredJobRole(String preferredJobRole) { this.preferredJobRole = preferredJobRole; }

    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }

    public int getEmployabilityScore() { return employabilityScore; }
    public void setEmployabilityScore(int employabilityScore) { this.employabilityScore = employabilityScore; }
}
"
Set-Content -Path "\Student.java" -Value $studentModel

$facultyModel = "package com.careerpulse.model;

public class Faculty extends User {
    private String firstName;
    private String lastName;
    private int departmentId;
    private String phone;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
"
Set-Content -Path "\Faculty.java" -Value $facultyModel

$recruiterModel = "package com.careerpulse.model;

public class Recruiter extends User {
    private String firstName;
    private String lastName;
    private String companyName;
    private String designation;
    private String phone;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
"
Set-Content -Path "\Recruiter.java" -Value $recruiterModel

$adminModel = "package com.careerpulse.model;

public class Admin extends User {
    private String firstName;
    private String lastName;
    private String phone;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
"
Set-Content -Path "\Admin.java" -Value $adminModel
