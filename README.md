# CAREERPULSE
**Student Employability and Skill Readiness Assessment System**

A professional JavaFX Desktop Application built for tracking and improving student employability readiness.

## 🚀 Tech Stack
* **Language:** Java 17
* **UI Framework:** JavaFX
* **Database:** MySQL
* **Database Connectivity:** JDBC
* **Build Tool:** Maven

---

## 🛠️ Setup Instructions for Team Members

Since this is a Java Desktop Application connected to a database, you need to set up the database on your computer before running the app.

### 1. Database Setup (MySQL)
You must have MySQL Server installed on your computer.

1. Open **MySQL Workbench** (or your preferred SQL client).
2. Open the file located at `src/main/resources/database/schema.sql` and run all the queries. This will create the `career_pulse` database and all required tables.
3. Open the file located at `src/main/resources/database/seed.sql` and run all the queries. This will insert demo users, skills, and scoring rules.
4. Open `src/main/resources/database.properties` in your code editor. Update the `db.username` and `db.password` to match your local MySQL credentials.

### 2. Running the Application

This project uses the Maven Wrapper, so you do not need to install Maven manually.

**Using Command Prompt or PowerShell:**
1. Open your terminal in the `careerpulse` folder.
2. Compile the project:
   ```bash
   mvnw clean compile
   ```
3. Run the application:
   ```bash
   mvnw javafx:run
   ```

*(If you are using an IDE like IntelliJ IDEA or Eclipse, simply open the `pom.xml` as a project and run the `Main.java` file).*

---

## 🔐 Demo Accounts

All demo accounts use the same hashed password.
**Password for all accounts:** `password`

* **Admin:** `admin@careerpulse.com`
* **Faculty 1:** `faculty1@careerpulse.com`
* **Faculty 2:** `faculty2@careerpulse.com`
* **Recruiter 1:** `recruiter1@careerpulse.com`
* **Student 1:** `student1@careerpulse.com`
* **Student 2:** `student2@careerpulse.com`
