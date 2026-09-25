CREATE TABLE IF NOT EXISTS learning_modules (
 id INT AUTO_INCREMENT PRIMARY KEY, course_id INT NOT NULL, title VARCHAR(200) NOT NULL,
 description TEXT, position INT NOT NULL DEFAULT 1, published TINYINT NOT NULL DEFAULT 0,
 FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_units (
 id INT AUTO_INCREMENT PRIMARY KEY, module_id INT NOT NULL, title VARCHAR(200) NOT NULL,
 content LONGTEXT, video_url TEXT, image_url TEXT, duration_minutes INT DEFAULT 10,
 position INT NOT NULL DEFAULT 1, published TINYINT NOT NULL DEFAULT 0,
 FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_assessments (
 id INT AUTO_INCREMENT PRIMARY KEY, course_id INT NOT NULL, unit_id INT NULL UNIQUE,
 title VARCHAR(200) NOT NULL, kind ENUM('unit','exam') NOT NULL,
 pass_mark INT NOT NULL DEFAULT 70, time_limit_minutes INT NOT NULL DEFAULT 30,
 max_attempts INT NOT NULL DEFAULT 3, questions LONGTEXT NOT NULL,
 published TINYINT NOT NULL DEFAULT 0, version INT NOT NULL DEFAULT 1,
 FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY (unit_id) REFERENCES learning_units(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS student_modules (
 user_id INT NOT NULL, module_id INT NOT NULL, enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id, module_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS student_units (
 user_id INT NOT NULL, unit_id INT NOT NULL, read_at DATETIME NULL, completed_at DATETIME NULL,
 PRIMARY KEY (user_id, unit_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (unit_id) REFERENCES learning_units(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_attempts (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, assessment_id INT NOT NULL,
 version INT NOT NULL, started_at DATETIME NOT NULL, expires_at DATETIME NOT NULL,
 submitted_at DATETIME NULL, score DECIMAL(5,2) NULL, passed TINYINT NOT NULL DEFAULT 0,
 answers LONGTEXT, snapshot LONGTEXT NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (assessment_id) REFERENCES learning_assessments(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_allowances (
 user_id INT NOT NULL, assessment_id INT NOT NULL, extra_attempts INT DEFAULT 0,
 PRIMARY KEY (user_id, assessment_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (assessment_id) REFERENCES learning_assessments(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_certificates (
 id INT AUTO_INCREMENT PRIMARY KEY, code CHAR(36) NOT NULL UNIQUE,
 user_id INT NOT NULL, course_id INT NOT NULL, student_name VARCHAR(150) NOT NULL,
 course_title VARCHAR(200) NOT NULL, score DECIMAL(5,2) NOT NULL,
 issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, revoked_at DATETIME NULL,
 UNIQUE (user_id, course_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS account_activations (
 user_id INT PRIMARY KEY, token_hash CHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS learning_notifications (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, recipient VARCHAR(200) NOT NULL,
 subject VARCHAR(200) NOT NULL, body TEXT NOT NULL, sent_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_error VARCHAR(200),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
