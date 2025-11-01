# 🗄️ Database Seed Scripts

This folder contains SQL scripts to populate the database with sample data.

---

## 📋 Available Scripts

### 1. **seed_models.sql**
Populates the `model` table with 5 ML models.

**Models**:
- CNN (Accuracy: 92%)
- RNN (Accuracy: 88%)
- LSTM (Accuracy: 90%)
- BiLSTM (Accuracy: 91%)
- BiLSTM+CNN (Accuracy: 93%)

### 2. **seed_labels_and_emails.sql**
Populates the `label` and `email` tables with sample data.

**Labels** (6 total):
- Bảo mật (Security)
- Công việc (Work)
- Gia đình (Family)
- Học tập (Study)
- Quảng cáo (Advertisement)
- Spam

**Emails**: 10 sample emails for each label (60 total)

---

## 🚀 How to Run

### Method 1: MySQL Command Line

```bash
# Navigate to project root
cd /Users/thanhnguyenduc/dev/Side\ Projects/EmailClassification

# Run models seed script
mysql -u your_username -p your_database < database/seed_models.sql

# Run labels and emails seed script
mysql -u your_username -p your_database < database/seed_labels_and_emails.sql
```

### Method 2: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the SQL file (File → Open SQL Script)
4. Execute the script (⚡ icon or Ctrl+Shift+Enter)

### Method 3: Direct MySQL

```bash
# Login to MySQL
mysql -u your_username -p

# Select database
USE your_database;

# Run script
source /path/to/database/seed_models.sql;
source /path/to/database/seed_labels_and_emails.sql;
```

---

## 📊 What Gets Created

### After Running seed_models.sql

```
model table:
+----+---------------------------+-----------+----------+-----------+--------+---------+----------+
| id | path                      | version   | accuracy | precision | recall | f1Score | isActive |
+----+---------------------------+-----------+----------+-----------+--------+---------+----------+
|  1 | /models/cnn_model.h5      | CNN       |     0.92 |      0.89 |   0.91 |    0.90 |        1 |
|  2 | /models/rnn_model.h5      | RNN       |     0.88 |      0.85 |   0.87 |    0.86 |        1 |
|  3 | /models/lstm_model.h5     | LSTM      |     0.90 |      0.87 |   0.89 |    0.88 |        1 |
|  4 | /models/bilstm_model.h5   | BiLSTM    |     0.91 |      0.88 |   0.90 |    0.89 |        1 |
|  5 | /models/bilstm_cnn_model.h5| BiLSTM+CNN|     0.93 |      0.90 |   0.92 |    0.91 |        1 |
+----+---------------------------+-----------+----------+-----------+--------+---------+----------+
```

### After Running seed_labels_and_emails.sql

```
label table:
+----+------------+
| id | name       |
+----+------------+
|  1 | Bảo mật    |
|  2 | Công việc  |
|  3 | Gia đình   |
|  4 | Học tập    |
|  5 | Quảng cáo  |
|  6 | Spam       |
+----+------------+

email table: 60 emails (10 per label)
+----+----------------------------------+--------------------------------------------------+---------+
| id | title                            | content                                          | labelId |
+----+----------------------------------+--------------------------------------------------+---------+
|  1 | Cảnh báo đăng nhập từ thiết bị mới| Chúng tôi phát hiện đăng nhập từ thiết bị mới... |       1 |
|  2 | Yêu cầu xác thực hai yếu tố      | Để bảo vệ tài khoản của bạn...                   |       1 |
| .. | ...                              | ...                                              |     ... |
| 60 | Làm giàu không cần vốn           | Bí quyết làm giàu không cần vốn...               |       6 |
+----+----------------------------------+--------------------------------------------------+---------+
```

---

## ✅ Verification

After running the scripts, verify the data:

```sql
-- Check labels
SELECT * FROM label;

-- Check email count by label
SELECT 
    l.name AS 'Label',
    COUNT(e.id) AS 'Email Count'
FROM label l
LEFT JOIN email e ON l.id = e.labelId
GROUP BY l.id, l.name
ORDER BY l.name;

-- Check models
SELECT * FROM model WHERE isActive = 1;

-- Check total counts
SELECT 
    'Labels' AS 'Table',
    COUNT(*) AS 'Count'
FROM label
UNION ALL
SELECT 
    'Emails' AS 'Table',
    COUNT(*) AS 'Count'
FROM email
UNION ALL
SELECT 
    'Models' AS 'Table',
    COUNT(*) AS 'Count'
FROM model;
```

**Expected Output**:
```
+--------+-------+
| Table  | Count |
+--------+-------+
| Labels |     6 |
| Emails |    60 |
| Models |     5 |
+--------+-------+
```

---

## 🔄 Re-running Scripts

### Clear Existing Data (Optional)

If you want to clear existing data before re-running:

```sql
-- Clear emails and labels
DELETE FROM email;
DELETE FROM label;

-- Clear models
DELETE FROM model;

-- Reset auto-increment
ALTER TABLE email AUTO_INCREMENT = 1;
ALTER TABLE label AUTO_INCREMENT = 1;
ALTER TABLE model AUTO_INCREMENT = 1;
```

**Note**: The seed scripts include commented-out DELETE statements. Uncomment them if you want to clear data automatically.

---

## 📝 Sample Email Content

### Bảo mật (Security)
- Login alerts
- Two-factor authentication
- Password changes
- Security warnings
- Verification codes

### Công việc (Work)
- Meeting reminders
- Project deadlines
- Leave approvals
- Training notifications
- Reports and KPIs

### Gia đình (Family)
- Family gatherings
- Birthday reminders
- Photo sharing
- Health appointments
- Recipe sharing

### Học tập (Study)
- Exam schedules
- Assignment deadlines
- Grade notifications
- Class cancellations
- Scholarship announcements

### Quảng cáo (Advertisement)
- Sales and discounts
- Course promotions
- Credit card offers
- Travel deals
- Product launches

### Spam
- Fake lottery wins
- Get-rich-quick schemes
- Phishing attempts
- Fake product claims
- Suspicious links

---

## 🎯 Use Cases

### For Development
- Test email classification features
- Train ML models
- Test search and filtering
- Develop UI components

### For Testing
- Test retrain model feature
- Verify label assignment
- Test email listing
- Validate data integrity

### For Demo
- Show email classification
- Demonstrate model training
- Present to stakeholders
- User acceptance testing

---

## ⚠️ Important Notes

1. **Character Encoding**: Make sure your database uses UTF-8 encoding to support Vietnamese characters.

   ```sql
   ALTER DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Foreign Keys**: The scripts assume foreign key constraints are properly set up.

3. **User IDs**: Sample emails have `userId = NULL`. Update them if you need to assign to specific users.

4. **Dataset IDs**: Sample emails have `datasetId = NULL`. Update if you're using datasets.

---

## 🔧 Troubleshooting

### Error: "Table doesn't exist"
**Solution**: Make sure you've run database migrations first.

```bash
npm run migrate  # or your migration command
```

### Error: "Duplicate entry"
**Solution**: Clear existing data first or use `ON DUPLICATE KEY UPDATE`.

### Error: "Foreign key constraint fails"
**Solution**: Make sure the `label` table is populated before inserting emails.

### Error: "Character encoding issues"
**Solution**: Set proper encoding:

```sql
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

---

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [UTF-8 in MySQL](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode.html)

---

**Happy Seeding! 🌱**

