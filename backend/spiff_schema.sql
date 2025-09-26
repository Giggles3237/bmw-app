-- Spiff Management System Database Schema
-- Phase 1: Core infrastructure for monthly spiff management

-- Spiff categories (Product, Performance, Contest, Manufacturer, Recognition)
CREATE TABLE IF NOT EXISTS spiff_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spiff types within each category
CREATE TABLE IF NOT EXISTS spiff_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_amount DECIMAL(10,2),
  calculation_method ENUM('fixed', 'percentage', 'tiered', 'custom') DEFAULT 'fixed',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES spiff_categories(id) ON DELETE SET NULL,
  INDEX idx_category_active (category_id, is_active)
);

-- Monthly spiff assignments
CREATE TABLE IF NOT EXISTS monthly_spiffs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  salesperson_id INT,
  spiff_type_id INT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status ENUM('draft', 'pending', 'approved', 'paid', 'cancelled') DEFAULT 'draft',
  created_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  paid_at TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (salesperson_id) REFERENCES salespersons(id) ON DELETE CASCADE,
  FOREIGN KEY (spiff_type_id) REFERENCES spiff_types(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_monthly_spiff (month, year, salesperson_id, spiff_type_id),
  INDEX idx_month_year (month, year),
  INDEX idx_salesperson (salesperson_id),
  INDEX idx_status (status)
);

-- Insert default spiff categories
INSERT IGNORE INTO spiff_categories (id, name, description) VALUES
(1, 'Product Performance', 'Bonuses for selling specific products'),
(2, 'Volume/Unit', 'Bonuses based on unit sales volume'),
(3, 'Contest', 'Competition-based bonuses and prizes'),
(4, 'Manufacturer', 'Factory incentives and promotions'),
(5, 'Special Recognition', 'Recognition and achievement awards');

-- Insert current spiff types based on existing system
INSERT IGNORE INTO spiff_types (id, category_id, name, description, default_amount, calculation_method) VALUES
-- Product Performance Spiffs
(1, 1, 'VSC Bonus', 'Vehicle Service Contract bonus', 50.00, 'fixed'),
(2, 1, 'Cilajet Bonus', 'Cilajet protection bonus', 50.00, 'fixed'),
(3, 1, 'Tire & Wheel Protection Bonus', 'Tire and wheel protection bonus', 50.00, 'fixed'),
(4, 1, 'LoJack Bonus', 'LoJack security system bonus', 50.00, 'fixed'),
(5, 1, 'Maintenance Bonus (MINI)', 'Maintenance plan bonus for MINI advisors', 50.00, 'fixed'),
(6, 1, 'Excess Wear & Tear Bonus (MINI)', 'Excess wear and tear bonus for MINI advisors', 50.00, 'fixed'),

-- Volume/Unit Spiffs
(7, 2, 'Unit Bonus', 'Bonus for achieving 10+ units', 500.00, 'fixed'),
(8, 2, 'Demo Vehicle Allowance', 'Monthly allowance for 8+ units', 300.00, 'fixed'),

-- Contest Spiffs
(9, 3, 'Sales Contest Winner', 'Monthly sales contest winner prize', 0.00, 'fixed'),
(10, 3, 'Product Penetration Leader', 'Highest product penetration rate', 0.00, 'fixed'),

-- Manufacturer Spiffs
(11, 4, 'BMW Factory Incentive', 'BMW manufacturer incentive', 0.00, 'fixed'),
(12, 4, 'MINI Factory Incentive', 'MINI manufacturer incentive', 0.00, 'fixed'),

-- Special Recognition
(13, 5, 'Employee of the Month', 'Monthly employee recognition', 0.00, 'fixed'),
(14, 5, 'Customer Service Excellence', 'Outstanding customer service recognition', 0.00, 'fixed');
