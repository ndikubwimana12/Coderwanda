-- ============================================================
--  CODERWANDA DATABASE SCHEMA
-- ============================================================




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


            CREATE TABLE IF NOT EXISTS job_openings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                type VARCHAR(100) DEFAULT 'Full-time',
                location VARCHAR(255) DEFAULT 'Musanze, Rwanda',
                level VARCHAR(100) DEFAULT 'Junior / Mid-level',
                description TEXT NOT NULL,
                skills TEXT,
                responsibilities TEXT,
                active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;

            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'Web Application',
                description TEXT NOT NULL,
                client VARCHAR(255) DEFAULT 'CodeRwanda',
                image TEXT,
                url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;

            CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                excerpt TEXT,
                content LONGTEXT NOT NULL,
                author VARCHAR(255) DEFAULT 'CodeRwanda Team',
                image TEXT,
                category VARCHAR(100) DEFAULT 'Technology',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;

            CREATE TABLE IF NOT EXISTS testimonials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) DEFAULT 'Student / Client',
                company VARCHAR(255) DEFAULT 'Rwanda',
                content TEXT NOT NULL,
                rating INT DEFAULT 5,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;

            CREATE TABLE IF NOT EXISTS partners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                logo TEXT,
                website VARCHAR(255),
                category VARCHAR(100) DEFAULT 'Partner',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ;
