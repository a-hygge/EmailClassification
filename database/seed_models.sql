-- ============================================
-- Seed data for tblModel table
-- ============================================
-- This script populates the tblModel table with available ML models
-- Phù hợp với cấu trúc create_table.sql:
--   - tblModel (id, path, version, accuracy, precision, recall, f1_score, 
--               created_at, updated_at, is_active, tbl_dataset_id)
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM tblModel;
-- ALTER TABLE tblModel AUTO_INCREMENT = 1;

-- Insert sample models (tbl_dataset_id là NULL vì chưa có dataset)
INSERT INTO tblModel (path, version, accuracy, `precision`, recall, f1_score, created_at, updated_at, is_active, tbl_dataset_id)
VALUES 
  ('ml_models/email_cnn_model.h5', '1.0.0', 0.97, 0.97, 0.97, 0.97, NOW(), NOW(), 1, NULL),
  ('ml_models/email_rnn_model.h5', '1.0.0', 0.93, 0.93, 0.93, 0.93, NOW(), NOW(), 0, NULL),
  ('ml_models/email_lstm_model.h5', '1.0.0', 0.96, 0.96, 0.96, 0.96, NOW(), NOW(), 0, NULL),
  ('ml_models/email_bilstm_model.h5', '1.0.0', 0.96, 0.97, 0.96, 0.97, NOW(), NOW(), 0, NULL),
  ('ml_models/email_bilstm_cnn_model.h5', '1.0.0', 0.96, 0.96, 0.96, 0.96, NOW(), NOW(), 0, NULL);

-- ============================================
-- VERIFY DATA
-- ============================================

-- Display inserted models
SELECT 
    id,
    path,
    version,
    accuracy,
    `precision`,
    recall,
    f1_score,
    is_active,
    created_at,
    updated_at
FROM tblModel 
ORDER BY id;

-- Display summary
SELECT 
    'Total Models' AS 'Metric',
    COUNT(*) AS 'Count'
FROM tblModel
UNION ALL
SELECT 
    'Active Models' AS 'Metric',
    COUNT(*) AS 'Count'
FROM tblModel
WHERE is_active = 1;

