-- =============================================
-- CÁC BẢNG NỀN TẢNG (DÙNG CHUNG)
-- =============================================

CREATE TABLE IF NOT EXISTS tblUser (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS tblLabel (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255)
);
-- TBLDATASET: Lưu lại các samples đã được dùng để training và người dùng nhấn save model thì mới lưu các mẫu đã dùng vào dataset
CREATE TABLE IF NOT EXISTS tblDataset (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    path VARCHAR(255),
    created_at TIMESTAMP,
    description VARCHAR(255),
    quantity INT(10)
);

-- =============================================
-- BẢNG EMAIL DÙNG CHUNG CHO CẢ 2 MODULE
-- =============================================
CREATE TABLE IF NOT EXISTS tblEmail (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content VARCHAR(5000),
    tbl_label_id INT(10) NULL, -- Nếu là sample thì có thể có label
    FOREIGN KEY (tbl_label_id) REFERENCES tblLabel(id) ON DELETE SET NULL
);

-- =============================================
-- MODULE RETRAIN MODEL (CẬP NHẬT SAU KHI GỘP)
-- =============================================

CREATE TABLE IF NOT EXISTS tblModel (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255),
    version VARCHAR(50), 
    accuracy FLOAT(10),
    `precision` FLOAT(10),
    recall FLOAT(10),
    f1_score FLOAT(10),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BIT,
    tbl_dataset_id INT(10), -- Cái này chỉ lưu nếu model được train và save sau đó mới lưu dataset đã dùng
    FOREIGN KEY (tbl_dataset_id) REFERENCES tblDataset(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tblTrainingJob (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    model_type VARCHAR(255),
    model_path VARCHAR(255),
    status VARCHAR(255),
    hyperparameters VARCHAR(5000),
    result VARCHAR(5000),
    tbl_user_id INT(10) NOT NULL,
    FOREIGN KEY (tbl_user_id) REFERENCES tblUser(id) ON DELETE CASCADE
);

-- Bảng liên kết người dùng với email (cả live và sample)
CREATE TABLE IF NOT EXISTS tblEmailUser (
    tbl_user_id INT(10) NOT NULL,
    tbl_email_id INT(10) NOT NULL,
    type VARCHAR(255),
    PRIMARY KEY (tbl_user_id, tbl_email_id),
    FOREIGN KEY (tbl_user_id) REFERENCES tblUser(id) ON DELETE CASCADE,
    FOREIGN KEY (tbl_email_id) REFERENCES tblEmail(id) ON DELETE CASCADE
);

-- Bảng nối Dataset và Email (nếu là sample)
CREATE TABLE IF NOT EXISTS tblDatasetEmail (
    tbl_dataset_id INT(10) NOT NULL,
    tbl_email_id INT(10) NOT NULL,
    PRIMARY KEY (tbl_dataset_id, tbl_email_id),
    FOREIGN KEY (tbl_dataset_id) REFERENCES tblDataset(id) ON DELETE CASCADE,
    FOREIGN KEY (tbl_email_id) REFERENCES tblEmail(id) ON DELETE CASCADE
);
