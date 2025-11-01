# 🌱 Database Seed Data - Implementation Summary

## ✅ What Was Created

A comprehensive SQL script to populate the database with sample labels and emails for testing and development.

---

## 📦 Files Created

1. ✅ **`database/seed_labels_and_emails.sql`**
   - Inserts 6 labels
   - Inserts 60 sample emails (10 per label)
   - Includes verification queries

2. ✅ **`database/README.md`**
   - Complete documentation
   - Usage instructions
   - Troubleshooting guide

---

## 📊 Data Structure

### Labels (6 total)

| ID | Name | Description | Email Count |
|----|------|-------------|-------------|
| 1 | Bảo mật | Security-related emails | 10 |
| 2 | Công việc | Work-related emails | 10 |
| 3 | Gia đình | Family-related emails | 10 |
| 4 | Học tập | Study-related emails | 10 |
| 5 | Quảng cáo | Advertisement emails | 10 |
| 6 | Spam | Spam emails | 10 |

**Total**: 60 emails

---

## 📧 Sample Email Categories

### 1. Bảo mật (Security) - 10 emails
- Cảnh báo đăng nhập từ thiết bị mới
- Yêu cầu xác thực hai yếu tố
- Thông báo thay đổi mật khẩu
- Phát hiện hoạt động bất thường
- Cập nhật chính sách bảo mật
- Mã xác thực đăng nhập
- Cảnh báo vi phạm bảo mật
- Xác nhận thiết bị đáng tin cậy
- Khôi phục mật khẩu
- Thông báo phiên đăng nhập hết hạn

### 2. Công việc (Work) - 10 emails
- Họp team buổi sáng 9h
- Deadline dự án ABC
- Yêu cầu nghỉ phép đã được duyệt
- Thông báo đào tạo nhân viên mới
- Báo cáo tháng 10 cần nộp
- Thay đổi lịch họp khách hàng
- Chúc mừng hoàn thành KPI quý 3
- Thông báo bảo trì hệ thống
- Mời tham gia dự án mới
- Phiếu lương tháng 10

### 3. Gia đình (Family) - 10 emails
- Họp mặt gia đình cuối tuần
- Sinh nhật bé Minh
- Ảnh du lịch Đà Lạt
- Lịch khám sức khỏe định kỳ
- Công thức món ăn mới
- Kế hoạch nghỉ lễ 2/9
- Chúc mừng sinh nhật bố
- Nhờ đón bé đi học
- Kết quả học tập của con
- Mời dự đám cưới

### 4. Học tập (Study) - 10 emails
- Thông báo lịch thi cuối kỳ
- Nộp bài tập lớn môn Lập trình
- Kết quả thi giữa kỳ
- Thông báo nghỉ học bù
- Tài liệu bài giảng tuần 8
- Mời tham gia seminar AI
- Thông báo đăng ký học phần
- Kết quả đề tài nghiên cứu
- Thông báo học bổng
- Lịch bảo vệ đồ án tốt nghiệp

### 5. Quảng cáo (Advertisement) - 10 emails
- Giảm giá 50% Black Friday
- Khóa học lập trình miễn phí
- Ưu đãi thẻ tín dụng mới
- Mua 1 tặng 1 pizza
- Khuyến mãi du lịch Phú Quốc
- Giảm giá iPhone 15 Pro
- Khóa học tiếng Anh online
- Ưu đãi gói gym 12 tháng
- Flash sale laptop gaming
- Bảo hiểm sức khỏe ưu đãi

### 6. Spam - 10 emails
- Bạn đã trúng giải 500 triệu
- Kiếm tiền online tại nhà
- Tài khoản của bạn bị khóa
- Thuốc giảm cân thần thánh
- Bạn có 1 tin nhắn mới
- Cơ hội đầu tư sinh lời 300%
- Xác nhận đơn hàng #12345
- Bạn được tặng iPhone 15
- Cảnh báo virus máy tính
- Làm giàu không cần vốn

---

## 🚀 How to Use

### Step 1: Run the SQL Script

```bash
# Method 1: Command line
mysql -u your_username -p your_database < database/seed_labels_and_emails.sql

# Method 2: MySQL Workbench
# Open the file and execute
```

### Step 2: Verify Data

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
```

**Expected Output**:
```
+------------+-------------+
| Label      | Email Count |
+------------+-------------+
| Bảo mật    |          10 |
| Công việc  |          10 |
| Gia đình   |          10 |
| Học tập    |          10 |
| Quảng cáo  |          10 |
| Spam       |          10 |
+------------+-------------+
```

### Step 3: Test the Application

1. Navigate to `/retrain`
2. You should see 60 emails in the sample selection table
3. Filter by label to see 10 emails per category
4. Select samples and test the retrain feature

---

## 📋 Use Cases

### 1. Development
- ✅ Test email listing functionality
- ✅ Test label filtering
- ✅ Test search functionality
- ✅ Develop UI components

### 2. Testing Retrain Feature
- ✅ Select 10+ samples from different labels
- ✅ Test model training with diverse data
- ✅ Verify label distribution
- ✅ Test edge cases

### 3. ML Model Training
- ✅ Balanced dataset (10 emails per label)
- ✅ Diverse content for each category
- ✅ Realistic Vietnamese email content
- ✅ Good for testing classification accuracy

### 4. Demo & Presentation
- ✅ Show email classification
- ✅ Demonstrate filtering
- ✅ Present to stakeholders
- ✅ User acceptance testing

---

## 🎯 Data Quality

### Realistic Content
- ✅ Real-world email scenarios
- ✅ Vietnamese language
- ✅ Appropriate length (not too short/long)
- ✅ Natural writing style

### Balanced Distribution
- ✅ 10 emails per label
- ✅ Equal representation
- ✅ Good for ML training
- ✅ Prevents bias

### Diverse Topics
- ✅ Security alerts
- ✅ Work communications
- ✅ Family messages
- ✅ Academic notifications
- ✅ Marketing content
- ✅ Spam examples

---

## 🔧 Customization

### Add More Emails

```sql
INSERT INTO email (title, content, labelId, userId, datasetId, createdAt, updatedAt)
VALUES 
('Your Title', 'Your Content', @label_id, NULL, NULL, NOW(), NOW());
```

### Add New Labels

```sql
INSERT INTO label (name, createdAt, updatedAt)
VALUES ('New Label', NOW(), NOW());
```

### Update Email Content

```sql
UPDATE email 
SET title = 'New Title', content = 'New Content'
WHERE id = 1;
```

---

## ✅ Benefits

### For Developers
- ✅ Quick setup with realistic data
- ✅ No need to manually create test data
- ✅ Consistent test environment
- ✅ Easy to reset and re-run

### For Testers
- ✅ Comprehensive test coverage
- ✅ Edge cases included
- ✅ Realistic scenarios
- ✅ Easy to verify results

### For ML Training
- ✅ Balanced dataset
- ✅ Diverse content
- ✅ Good for classification
- ✅ Realistic Vietnamese text

---

## 📊 Database Impact

### Before Running Script
```
label table: 0 rows
email table: 0 rows (or existing data)
```

### After Running Script
```
label table: 6 rows
email table: +60 rows
Total: 66 new rows
```

### Storage
- Approximate size: ~50KB
- Minimal impact on database
- Fast to insert and query

---

## 🧪 Testing Checklist

After running the script:

- [ ] Verify 6 labels exist
- [ ] Verify 60 emails exist
- [ ] Check each label has 10 emails
- [ ] Test email listing page
- [ ] Test label filtering
- [ ] Test search functionality
- [ ] Test retrain sample selection
- [ ] Verify Vietnamese characters display correctly
- [ ] Test with different browsers
- [ ] Check mobile responsiveness

---

## 🔄 Re-running the Script

### Option 1: Clear and Re-run

```sql
-- Clear existing data
DELETE FROM email WHERE labelId IN (SELECT id FROM label);
DELETE FROM label;

-- Reset auto-increment
ALTER TABLE email AUTO_INCREMENT = 1;
ALTER TABLE label AUTO_INCREMENT = 1;

-- Re-run the script
source database/seed_labels_and_emails.sql;
```

### Option 2: Append Data

The script uses variables to get label IDs, so it can be run multiple times without conflicts (but will create duplicate labels).

---

## ⚠️ Important Notes

1. **Character Encoding**: Ensure UTF-8 encoding for Vietnamese characters
2. **Foreign Keys**: Labels must exist before inserting emails
3. **User IDs**: Sample emails have `userId = NULL`
4. **Dataset IDs**: Sample emails have `datasetId = NULL`
5. **Timestamps**: All use `NOW()` for current timestamp

---

## 📝 Summary

### Files Created (2)
- ✅ `database/seed_labels_and_emails.sql` - Main seed script
- ✅ `database/README.md` - Documentation

### Data Created
- ✅ 6 Labels (Vietnamese categories)
- ✅ 60 Emails (10 per label)
- ✅ Realistic Vietnamese content
- ✅ Balanced distribution

### Ready For
- ✅ Development
- ✅ Testing
- ✅ ML Training
- ✅ Demo/Presentation

---

**Seed data is ready to use! 🌱**

Run the script and start testing your email classification system with realistic Vietnamese data!

