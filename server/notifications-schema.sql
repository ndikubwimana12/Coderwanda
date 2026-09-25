CREATE TABLE IF NOT EXISTS dashboard_notifications (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, actor_id INT NULL, scope VARCHAR(20) NOT NULL,
 recipient_id INT NULL, course_id INT NULL, section VARCHAR(160) NOT NULL,
 title VARCHAR(240) NOT NULL, href VARCHAR(240) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX(scope,recipient_id,id), INDEX(course_id,id),
 FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS dashboard_notification_reads (
 user_id INT NOT NULL, notification_id BIGINT NOT NULL, read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id,notification_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(notification_id) REFERENCES dashboard_notifications(id) ON DELETE CASCADE
);
