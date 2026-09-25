CREATE TABLE IF NOT EXISTS course_trainers (
 course_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(course_id,user_id),
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS coding_exercises (
 id INT AUTO_INCREMENT PRIMARY KEY, unit_id INT NOT NULL, title VARCHAR(200) NOT NULL,
 instructions TEXT NOT NULL, language ENUM('javascript','web') NOT NULL,
 starter LONGTEXT NOT NULL, tests LONGTEXT NOT NULL, rubric LONGTEXT NOT NULL,
 pass_mark INT NOT NULL DEFAULT 70, required TINYINT NOT NULL DEFAULT 0,
 published TINYINT NOT NULL DEFAULT 0, version INT NOT NULL DEFAULT 1,
 FOREIGN KEY(unit_id) REFERENCES learning_units(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS coding_drafts (
 exercise_id INT NOT NULL, user_id INT NOT NULL, files LONGTEXT NOT NULL,
 revision INT NOT NULL DEFAULT 1, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(exercise_id,user_id), FOREIGN KEY(exercise_id) REFERENCES coding_exercises(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS coding_submissions (
 id INT AUTO_INCREMENT PRIMARY KEY, exercise_id INT NOT NULL, user_id INT NOT NULL,
 version INT NOT NULL, files LONGTEXT NOT NULL, snapshot LONGTEXT NOT NULL,
 reflection TEXT NOT NULL, submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 status ENUM('submitted','reviewed') NOT NULL DEFAULT 'submitted', score DECIMAL(5,2) NULL,
 passed TINYINT NOT NULL DEFAULT 0, feedback TEXT, marks LONGTEXT, annotations LONGTEXT,
 reviewer_id INT NULL, reviewed_at DATETIME NULL,
 INDEX(exercise_id,user_id), FOREIGN KEY(exercise_id) REFERENCES coding_exercises(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS classroom_messages (
 id INT AUTO_INCREMENT PRIMARY KEY, course_id INT NOT NULL, student_id INT NULL,
 sender_id INT NOT NULL, body TEXT NOT NULL, reply_to INT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL,
 INDEX(course_id,student_id,id), FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(reply_to) REFERENCES classroom_messages(id) ON DELETE SET NULL
);
