-- ============================================================
--  CODERWANDA DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS coderwanda;
USE coderwanda;

-- ------------------------------------------------------------
--  USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)        NOT NULL,
    email       VARCHAR(200)        NOT NULL UNIQUE,
    phone       VARCHAR(50)         NOT NULL,
    password    VARCHAR(255)        NOT NULL,   -- bcrypt hash
    role        ENUM('user','admin') DEFAULT 'user',
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  PRODUCTS  (mirrors the store catalog in Ecommerce.jsx)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200)        NOT NULL,
    brand       VARCHAR(100)        NOT NULL,
    category    VARCHAR(100)        NOT NULL,
    price       INT                 NOT NULL,
    old_price   INT                 DEFAULT NULL,
    badge       VARCHAR(20)         DEFAULT NULL,
    rating      TINYINT             DEFAULT 5,
    reviews     INT                 DEFAULT 0,
    image       TEXT                NOT NULL,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  ORDERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NULL,
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(50)     NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    address         TEXT            NOT NULL,
    payment_method  ENUM('mobile-money','cash') DEFAULT 'mobile-money',
    total_amount    INT             NOT NULL,
    status          ENUM('pending','confirmed','delivered','cancelled') DEFAULT 'pending',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
--  ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT     NOT NULL,
    product_id  INT     NULL,
    name        VARCHAR(200) NOT NULL,
    price       INT     NOT NULL,
    quantity    INT     NOT NULL,
    image       TEXT,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
--  CONTACT MESSAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(200)    NOT NULL,
    phone       VARCHAR(50)     DEFAULT NULL,
    subject     VARCHAR(255)    NOT NULL,
    message     TEXT            NOT NULL,
    status      ENUM('unread','read','replied') DEFAULT 'unread',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  COURSES  (mirrors CourseDetails.jsx course data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(100)    NOT NULL UNIQUE,
    title       VARCHAR(200)    NOT NULL,
    category    VARCHAR(100)    NOT NULL,
    level       VARCHAR(50)     NOT NULL,
    duration    VARCHAR(50)     NOT NULL,
    lessons     INT             DEFAULT 0,
    price       INT             NOT NULL,
    old_price   INT             DEFAULT NULL,
    description TEXT            NOT NULL,
    image       TEXT            NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  COURSE ENROLLMENTS / APPLICATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT             NULL,
    course_id    INT             NULL,
    full_name    VARCHAR(150)    NULL,
    email        VARCHAR(200)    NULL,
    phone        VARCHAR(50)     NULL,
    education    VARCHAR(100)    NULL,
    experience   VARCHAR(50)     NULL,
    mode         VARCHAR(50)     NULL,
    start_period VARCHAR(50)     NULL,
    message      TEXT            NULL,
    status       ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
    enrolled_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
--  JOB APPLICATIONS (Careers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    job_id          INT NULL,
    job_title       VARCHAR(150) NOT NULL,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    phone           VARCHAR(50)  NOT NULL,
    portfolio_link  VARCHAR(255) NULL,
    message         TEXT,
    status          ENUM('pending','reviewed','shortlisted','rejected','hired') DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  SERVICES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(200)        NOT NULL,
    category          VARCHAR(100)        NOT NULL,
    short_description VARCHAR(500)        NOT NULL,
    description       TEXT                NOT NULL,
    image             TEXT                NULL,
    icon              VARCHAR(100)        NULL,
    features          LONGTEXT            NULL,
    active            TINYINT(1)          DEFAULT 1,
    created_at        TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  SUBSCRIBERS (Newsletter)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(200) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  SEED: PRODUCTS
-- ------------------------------------------------------------
INSERT IGNORE INTO products (id, name, brand, category, price, old_price, badge, rating, reviews, image) VALUES
(1,  'MacBook Air M2',       'Apple',    'Laptops',       1950000, NULL,    'New',  5, 24, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85'),
(2,  'iPhone 15 Pro',        'Apple',    'Smartphones',   1450000, 1580000, '-10%', 5, 31, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1000&q=85'),
(3,  'Sony WH-1000XM5',      'Sony',     'Accessories',    485000,  540000, 'Sale', 5, 18, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85'),
(4,  'Canon EOS Camera',     'Canon',    'Cameras',       1250000, 1390000, 'New',  5, 16, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=1000&q=85'),
(5,  'Dell XPS 15',          'Dell',     'Laptops',       1750000, 1890000, '-8%', 5, 12, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85'),
(6,  'Samsung Galaxy S24',   'Samsung',  'Smartphones',   1100000, 1220000, 'Sale', 5, 21, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85'),
(7,  'Wireless Keyboard',    'Logitech', 'Accessories',     85000,   99000, 'New',  5, 15, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85'),
(8,  'Security Camera',      'Hikvision','Cameras',        195000,  225000, '-15%', 4, 10, 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=85'),
(9,  'Apple Watch Series 9', 'Apple',    'Smart Devices',  765000, NULL,    'New',  5, 14, 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1000&q=85'),
(10, 'LG 27" 4K Monitor',    'LG',       'Accessories',    495000,  550000, 'Sale', 5,  9, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85'),
(11, 'Lenovo ThinkPad',      'Lenovo',   'Laptops',       1250000, 1390000, 'New',  5, 17, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85'),
(12, 'AirPods Pro',          'Apple',    'Accessories',    295000,  325000, '-8%', 5, 29, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=85');

-- ------------------------------------------------------------
--  SEED: COURSES
-- ------------------------------------------------------------
INSERT IGNORE INTO courses (id, slug, title, category, level, duration, lessons, price, old_price, description, image) VALUES
(1, 'web-development',
   'Full-Stack Web Development', 'Software Development', 'Intermediate', '6 Months', 48, 180000, 220000,
   'Master modern web development from frontend interfaces to powerful backend systems. Build real-world applications using technologies used by professional developers.',
   'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85'),
(2, 'data-science-ai',
   'Data Science & Artificial Intelligence', 'Data & AI', 'Intermediate', '5 Months', 42, 200000, 250000,
   'Learn how to work with data, build machine learning models and understand the foundations of artificial intelligence through practical projects.',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85'),
(3, 'cybersecurity',
   'Cybersecurity', 'Cybersecurity', 'Intermediate', '4 Months', 36, 170000, 210000,
   'Develop practical cybersecurity skills and learn how to protect systems, applications, networks and digital information.',
   'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1400&q=85');
