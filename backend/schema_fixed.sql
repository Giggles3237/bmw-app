-- Drop existing tables if they exist.  During development you can
-- run this script repeatedly to reset the database.  In production
-- environments you should use migrations rather than dropping
-- tables.
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS salespersons;
DROP TABLE IF EXISTS finance_managers;

-- Table of salespeople.  Each salesperson has a unique name and employee number.
-- Additional fields are included for future authentication system.
CREATE TABLE salespersons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  employee_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT FALSE,
  role ENUM('salesperson', 'manager', 'admin') DEFAULT 'salesperson',
  payplan ENUM('BMW', 'MINI', 'Hybrid') DEFAULT 'BMW',
  demo_eligible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_name_employee (name, employee_number)
);

-- Table of users.  This table handles authentication and user management.
-- Users can have different roles and may or may not be associated with salespersons.
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'salesperson', 'finance', 'viewer') DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  salesperson_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_salesperson FOREIGN KEY (salesperson_id)
    REFERENCES salespersons(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Table of finance managers.  Each finance manager also has a
-- unique name.  This table allows us to refer to finance
-- managers via foreign keys instead of storing plain text on the
-- deals table.
CREATE TABLE finance_managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- The central deals table.  Each row corresponds to a row in the
-- Data Master sheet.  Many columns are optional and may be NULL
-- if the value has not been provided yet.  Numeric values use
-- DECIMAL with two decimal places to store currency and totals.
CREATE TABLE deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  external_id INT,
  date DATE,
  month INT,
  year INT,
  bank VARCHAR(100),
  funded_date DATE,
  stock_number VARCHAR(50),
  name VARCHAR(100),
  salesperson_id INT,
  split DECIMAL(5,2),
  type VARCHAR(50),
  used_car_source VARCHAR(100),
  age INT,
  fe_gross DECIMAL(12,2),
  avp DECIMAL(12,2),
  be_gross DECIMAL(12,2),
  finance_manager_id INT,
  reserve DECIMAL(12,2),
  rewards DECIMAL(12,2),
  vsc DECIMAL(12,2),
  maintenance DECIMAL(12,2),
  gap DECIMAL(12,2),
  cilajet DECIMAL(12,2),
  diamon DECIMAL(12,2),
  key_product DECIMAL(12,2),
  collision_product DECIMAL(12,2),
  dent_product DECIMAL(12,2),
  excess DECIMAL(12,2),
  ppf DECIMAL(12,2),
  wheel_and_tire DECIMAL(12,2),
  product_count INT,
  money DECIMAL(12,2),
  titling DECIMAL(12,2),
  mileage DECIMAL(12,2),
  license_insurance DECIMAL(12,2),
  fees DECIMAL(12,2),
  notes TEXT,
  split2 DECIMAL(5,2),
  registration_complete_date DATE,
  CONSTRAINT fk_deals_salesperson FOREIGN KEY (salesperson_id)
    REFERENCES salespersons(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_deals_finance_manager FOREIGN KEY (finance_manager_id)
    REFERENCES finance_managers(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Create indexes to speed up reporting queries on month and year.
CREATE INDEX idx_deals_month_year ON deals (month, year);
CREATE INDEX idx_deals_salesperson ON deals (salesperson_id);
CREATE INDEX idx_salespersons_employee_number ON salespersons (employee_number);
CREATE INDEX idx_salespersons_email ON salespersons (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_salesperson_id ON users (salesperson_id);
