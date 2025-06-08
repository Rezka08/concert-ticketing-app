CREATE DATABASE IF NOT EXISTS concert_app2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE concert_app2;

-- 1. Drop tables if they already exist (reverse order due to foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS concerts;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Concerts Table
CREATE TABLE concerts (
    concert_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    banner_image VARCHAR(255),
    status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Ticket_Types Table
CREATE TABLE ticket_types (
    ticket_type_id INT PRIMARY KEY AUTO_INCREMENT,
    concert_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity_total INT NOT NULL,
    quantity_available INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tt_concert
      FOREIGN KEY (concert_id)
      REFERENCES concerts(concert_id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Orders Table
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_o_user
      FOREIGN KEY (user_id)
      REFERENCES users(user_id)
      ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Order_Items Table
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_oi_order
      FOREIGN KEY (order_id)
      REFERENCES orders(order_id)
      ON DELETE CASCADE,
    CONSTRAINT fk_oi_ticket_type
      FOREIGN KEY (ticket_type_id)
      REFERENCES ticket_types(ticket_type_id)
) ENGINE=InnoDB;

-- 7. Indexes for Join Performance
CREATE INDEX idx_tt_concert_id
  ON ticket_types(concert_id);

CREATE INDEX idx_o_user_id
  ON orders(user_id);

CREATE INDEX idx_oi_order_id
  ON order_items(order_id);

CREATE INDEX idx_oi_ticket_type_id
  ON order_items(ticket_type_id);

-- 8. Insert Initial Admin User (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'kelompok1@gmail.com', '$2a$10$LCSC74YNnTqBpD9/IYKDb.WCU0iw/QwRBYXM3FmZcUNtELIZECkGW', 'admin');

-- 9. Insert Sample Concerts
INSERT INTO concerts (title, description, venue, date, time, banner_image, status)
VALUES
  ('Rock Summer Festival', 'The biggest rock festival of the year with top artists from around the world.', 'Grand Arena', '2025-08-15', '18:00:00', 'https://source.unsplash.com/random/1200x600/?rock-concert', 'upcoming'),
  ('Jazz Night Live', 'An evening of smooth jazz with renowned jazz musicians.', 'Blue Note Club', '2025-07-20', '20:00:00', 'https://source.unsplash.com/random/1200x600/?jazz', 'upcoming'),
  ('Pop Music Extravaganza', 'Featuring the hottest pop stars and their chart-topping hits.', 'Sunshine Stadium', '2025-09-10', '19:30:00', 'https://source.unsplash.com/random/1200x600/?pop-concert', 'upcoming'),
  ('Classical Symphony', 'A night of classical masterpieces performed by the National Orchestra.', 'Opera House', '2025-06-25', '19:00:00', 'https://source.unsplash.com/random/1200x600/?orchestra', 'upcoming'),
  ('Electronic Dance Festival', 'Non-stop electronic dance music with world-famous DJs.', 'Beach Resort', '2025-08-05', '21:00:00', 'https://source.unsplash.com/random/1200x600/?edm-festival', 'upcoming');

-- 10. Insert Sample Ticket Types
-- Rock Summer Festival Tickets
INSERT INTO ticket_types (concert_id, name, price, quantity_total, quantity_available)
VALUES
  (1, 'VIP', 199.99, 100, 100),
  (1, 'Standard', 99.99, 500, 500),
  (1, 'Economy', 59.99, 1000, 1000);

-- Jazz Night Live Tickets
INSERT INTO ticket_types (concert_id, name, price, quantity_total, quantity_available)
VALUES
  (2, 'Premium', 129.99, 50, 50),
  (2, 'Regular', 79.99, 200, 200);

-- Pop Music Extravaganza Tickets
INSERT INTO ticket_types (concert_id, name, price, quantity_total, quantity_available)
VALUES
  (3, 'Front Row', 249.99, 50, 50),
  (3, 'Golden Circle', 179.99, 200, 200),
  (3, 'Regular Seating', 99.99, 500, 500),
  (3, 'Standing', 69.99, 1000, 1000);

-- Classical Symphony Tickets
INSERT INTO ticket_types (concert_id, name, price, quantity_total, quantity_available)
VALUES
  (4, 'Box Seats', 159.99, 30, 30),
  (4, 'Orchestra', 119.99, 150, 150),
  (4, 'Balcony', 79.99, 300, 300);

-- Electronic Dance Festival Tickets
INSERT INTO ticket_types (concert_id, name, price, quantity_total, quantity_available)
VALUES
  (5, 'VIP Pass', 299.99, 100, 100),
  (5, 'General Admission', 149.99, 1000, 1000);