-- ============================================
-- Seed Data for Labels and Sample Emails
-- ============================================
-- This script populates:
-- 1. 7 Labels (Bảo mật, Công việc, Gia đình, Giao dịch, Học tập, Quảng cáo, Spam)
-- 2. 10 Sample emails for each label (70 total emails)
-- ============================================
-- Phù hợp với cấu trúc create_table.sql:
--   - tblLabel (id, name, description)
--   - tblEmail (id, title, content, tblLabelId, sender, receiver)
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM tblEmailUser;
-- DELETE FROM tblDatasetEmail;
-- DELETE FROM tblEmail WHERE tbl_label_id IS NOT NULL;
-- DELETE FROM tblLabel;
-- ALTER TABLE tblLabel AUTO_INCREMENT = 1;
-- ALTER TABLE tblEmail AUTO_INCREMENT = 1;

-- ============================================
-- INSERT LABELS
-- ============================================

INSERT INTO tblLabel (name, description) VALUES
('Bảo mật', 'Email liên quan đến bảo mật tài khoản, mật khẩu, xác thực'),
('Công việc', 'Email công việc, họp hành, deadline, dự án'),
('Gia đình', 'Email gia đình, họp mặt, sinh nhật, sự kiện gia đình'),
('Giao dịch', 'Email giao dịch ngân hàng, thanh toán, hóa đơn'),
('Học tập', 'Email học tập, lịch thi, bài tập, thông báo trường học'),
('Quảng cáo', 'Email quảng cáo sản phẩm, dịch vụ, khuyến mãi'),
('Spam', 'Email spam, lừa đảo, quảng cáo rác');

-- ============================================
-- INSERT SAMPLE EMAILS
-- ============================================

-- ============================================
-- CONFIGURATION: Set the default receiver email
-- Change this value to match your user's email
-- ============================================
SET @default_receiver = 'nguyenthituanh135@gmail.com';

-- Get label IDs (assuming they start from 1)
SET @label_bao_mat = (SELECT id FROM tblLabel WHERE name = 'Bảo mật' LIMIT 1);
SET @label_cong_viec = (SELECT id FROM tblLabel WHERE name = 'Công việc' LIMIT 1);
SET @label_gia_dinh = (SELECT id FROM tblLabel WHERE name = 'Gia đình' LIMIT 1);
SET @label_hoc_tap = (SELECT id FROM tblLabel WHERE name = 'Học tập' LIMIT 1);
SET @label_quang_cao = (SELECT id FROM tblLabel WHERE name = 'Quảng cáo' LIMIT 1);
SET @label_spam = (SELECT id FROM tblLabel WHERE name = 'Spam' LIMIT 1);
SET @label_giao_dich = (SELECT id FROM tblLabel WHERE name = 'Giao dịch' LIMIT 1);
-- ============================================
-- BẢO MẬT (Security) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Cảnh báo đăng nhập từ thiết bị mới', 'Chúng tôi phát hiện đăng nhập từ thiết bị mới vào tài khoản của bạn. Nếu không phải bạn, vui lòng thay đổi mật khẩu ngay.', @label_bao_mat, 'security@example.com', @default_receiver),
('Yêu cầu xác thực hai yếu tố', 'Để bảo vệ tài khoản của bạn, chúng tôi khuyến nghị bật xác thực hai yếu tố. Nhấp vào đây để thiết lập.', @label_bao_mat, 'security@example.com', @default_receiver),
('Thông báo thay đổi mật khẩu', 'Mật khẩu của bạn đã được thay đổi thành công vào lúc 10:30 AM ngày 27/10/2025. Nếu không phải bạn, liên hệ ngay.', @label_bao_mat, 'noreply@example.com', @default_receiver),
('Phát hiện hoạt động bất thường', 'Hệ thống phát hiện hoạt động đăng nhập bất thường từ địa chỉ IP 192.168.1.100. Vui lòng xác nhận đây có phải là bạn.', @label_bao_mat, 'security@example.com', @default_receiver),
('Cập nhật chính sách bảo mật', 'Chúng tôi đã cập nhật chính sách bảo mật và quyền riêng tư. Vui lòng xem lại các thay đổi quan trọng.', @label_bao_mat, 'legal@example.com', @default_receiver),
('Mã xác thực đăng nhập', 'Mã xác thực của bạn là: 847392. Mã này có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.', @label_bao_mat, 'noreply@example.com', @default_receiver),
('Cảnh báo vi phạm bảo mật', 'Chúng tôi phát hiện có người cố gắng truy cập tài khoản của bạn 3 lần với mật khẩu sai. Tài khoản đã bị khóa tạm thời.', @label_bao_mat, 'security@example.com', @default_receiver),
('Xác nhận thiết bị đáng tin cậy', 'Bạn đã thêm thiết bị iPhone 13 vào danh sách thiết bị đáng tin cậy. Nếu không phải bạn, hãy xóa ngay.', @label_bao_mat, 'security@example.com', @default_receiver),
('Khôi phục mật khẩu', 'Bạn đã yêu cầu khôi phục mật khẩu. Nhấp vào liên kết sau để đặt lại mật khẩu. Liên kết có hiệu lực trong 1 giờ.', @label_bao_mat, 'noreply@example.com', @default_receiver),
('Thông báo phiên đăng nhập hết hạn', 'Phiên đăng nhập của bạn đã hết hạn vì lý do bảo mật. Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.', @label_bao_mat, 'security@example.com', @default_receiver);

-- ============================================
-- CÔNG VIỆC (Work) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Họp team buổi sáng 9h', 'Nhắc nhở: Họp team hàng tuần vào 9h sáng mai tại phòng họp A. Chủ đề: Review sprint và lên kế hoạch tuần mới.', @label_cong_viec, 'manager@company.com', @default_receiver),
('Deadline dự án ABC', 'Dự án ABC cần hoàn thành trước 5h chiều thứ Sáu. Vui lòng cập nhật tiến độ công việc vào hệ thống quản lý dự án.', @label_cong_viec, 'pm@company.com', @default_receiver),
('Yêu cầu nghỉ phép đã được duyệt', 'Đơn xin nghỉ phép của bạn từ ngày 1/11 đến 3/11 đã được quản lý phê duyệt. Chúc bạn có kỳ nghỉ vui vẻ.', @label_cong_viec, 'hr@company.com', @default_receiver),
('Thông báo đào tạo nhân viên mới', 'Buổi đào tạo cho nhân viên mới sẽ diễn ra vào thứ Hai tuần sau. Vui lòng chuẩn bị tài liệu và slide thuyết trình.', @label_cong_viec, 'training@company.com', @default_receiver),
('Báo cáo tháng 10 cần nộp', 'Nhắc nhở nộp báo cáo công việc tháng 10 trước ngày 31/10. Mẫu báo cáo đính kèm trong email này.', @label_cong_viec, 'manager@company.com', @default_receiver),
('Thay đổi lịch họp khách hàng', 'Cuộc họp với khách hàng XYZ đã được dời từ 2h chiều sang 4h chiều cùng ngày. Vui lòng cập nhật lịch.', @label_cong_viec, 'sales@company.com', @default_receiver),
('Chúc mừng hoàn thành KPI quý 3', 'Chúc mừng bạn đã hoàn thành xuất sắc KPI quý 3 với 120% chỉ tiêu. Phần thưởng sẽ được trao vào cuối tháng.', @label_cong_viec, 'ceo@company.com', @default_receiver),
('Thông báo bảo trì hệ thống', 'Hệ thống sẽ bảo trì từ 11h đêm đến 2h sáng ngày mai. Vui lòng lưu công việc và đăng xuất trước thời gian này.', @label_cong_viec, 'it@company.com', @default_receiver),
('Mời tham gia dự án mới', 'Bạn được mời tham gia dự án phát triển ứng dụng mobile mới. Cuộc họp kick-off sẽ diễn ra vào thứ Tư tuần sau.', @label_cong_viec, 'pm@company.com', @default_receiver),
('Phiếu lương tháng 10', 'Phiếu lương tháng 10 của bạn đã sẵn sàng. Vui lòng đăng nhập vào hệ thống HR để xem chi tiết và tải về.', @label_cong_viec, 'payroll@company.com', @default_receiver);

-- ============================================
-- GIA ĐÌNH (Family) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Họp mặt gia đình cuối tuần', 'Chào cả nhà, cuối tuần này mình tổ chức họp mặt gia đình tại nhà bà ngoại. Mọi người sắp xếp thời gian tham gia nhé!', @label_gia_dinh, 'anh.nguyen@gmail.com', @default_receiver),
('Sinh nhật bé Minh', 'Nhắc nhở: Sinh nhật bé Minh vào Chủ nhật tuần sau. Mọi người nhớ chuẩn bị quà và đến đúng giờ nhé.', @label_gia_dinh, 'chi.tran@gmail.com', @default_receiver),
('Ảnh du lịch Đà Lạt', 'Gửi cả nhà album ảnh chuyến du lịch Đà Lạt tuần trước. Mọi người xem và tải về làm kỷ niệm nhé!', @label_gia_dinh, 'em.le@gmail.com', @default_receiver),
('Lịch khám sức khỏe định kỳ', 'Mẹ nhắc con nhớ đi khám sức khỏe định kỳ vào thứ Năm tuần này. Mẹ đã đặt lịch sẵn rồi.', @label_gia_dinh, 'me.pham@gmail.com', @default_receiver),
('Công thức món ăn mới', 'Con gái gửi mẹ công thức làm bánh flan caramen. Mẹ thử làm xem có ngon không nhé!', @label_gia_dinh, @default_receiver, 'me.pham@gmail.com'),
('Kế hoạch nghỉ lễ 2/9', 'Cả nhà bàn bạc kế hoạch đi du lịch nghỉ lễ 2/9. Anh đề xuất đi Phú Quốc, mọi người ý kiến thế nào?', @label_gia_dinh, 'anh.nguyen@gmail.com', @default_receiver),
('Chúc mừng sinh nhật bố', 'Con chúc bố sinh nhật vui vẻ, sức khỏe dồi dào. Con sẽ về nhà vào cuối tuần để mừng sinh nhật bố.', @label_gia_dinh, @default_receiver, 'bo.nguyen@gmail.com'),
('Nhờ đón bé đi học', 'Chị nhờ em đón bé đi học hộ chiều nay vì chị có việc đột xuất. Em giúp chị nhé, cảm ơn em!', @label_gia_dinh, 'chi.tran@gmail.com', @default_receiver),
('Kết quả học tập của con', 'Thầy gửi phụ huynh kết quả học tập học kỳ 1 của em. Em học khá tốt, cần cố gắng thêm môn Toán.', @label_gia_dinh, 'giaovien@school.edu.vn', @default_receiver),
('Mời dự đám cưới', 'Mời cả gia đình tham dự đám cưới của anh Tuấn vào ngày 15/11. Địa điểm: Nhà hàng Riverside, 6h tối.', @label_gia_dinh, 'tuan.vo@gmail.com', @default_receiver);

-- ============================================
-- HỌC TẬP (Study) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Thông báo lịch thi cuối kỳ', 'Lịch thi cuối kỳ học kỳ 1 năm học 2025-2026 đã được công bố. Sinh viên vui lòng kiểm tra và chuẩn bị ôn tập.', @label_hoc_tap, 'daotao@university.edu.vn', @default_receiver),
('Nộp bài tập lớn môn Lập trình', 'Nhắc nhở: Bài tập lớn môn Lập trình Web cần nộp trước 11h59 tối Chủ nhật. Nộp qua hệ thống e-learning.', @label_hoc_tap, 'gv.laptrinhweb@university.edu.vn', @default_receiver),
('Kết quả thi giữa kỳ', 'Kết quả thi giữa kỳ môn Cơ sở dữ liệu đã được công bố. Sinh viên đăng nhập vào hệ thống để xem điểm.', @label_hoc_tap, 'gv.csdl@university.edu.vn', @default_receiver),
('Thông báo nghỉ học bù', 'Lớp Trí tuệ nhân tạo buổi thứ Tư tuần này nghỉ học do giảng viên bận công tác. Sẽ học bù vào thứ Bảy.', @label_hoc_tap, 'gv.ai@university.edu.vn', @default_receiver),
('Tài liệu bài giảng tuần 8', 'Giảng viên đã upload tài liệu bài giảng tuần 8 môn Học máy. Sinh viên tải về và đọc trước khi đến lớp.', @label_hoc_tap, 'gv.hocmay@university.edu.vn', @default_receiver),
('Mời tham gia seminar AI', 'Khoa CNTT tổ chức seminar về Trí tuệ nhân tạo vào thứ Sáu tuần sau. Sinh viên quan tâm đăng ký tham gia.', @label_hoc_tap, 'khoacntt@university.edu.vn', @default_receiver),
('Thông báo đăng ký học phần', 'Thời gian đăng ký học phần học kỳ 2 từ ngày 1/11 đến 10/11. Sinh viên lưu ý đăng ký đúng hạn.', @label_hoc_tap, 'daotao@university.edu.vn', @default_receiver),
('Kết quả đề tài nghiên cứu', 'Đề tài nghiên cứu khoa học của nhóm bạn đã được hội đồng phê duyệt. Chúc mừng và tiếp tục thực hiện tốt.', @label_hoc_tap, 'nckh@university.edu.vn', @default_receiver),
('Thông báo học bổng', 'Bạn đã được xét duyệt học bổng khuyến khích học tập học kỳ 1. Học bổng sẽ được chuyển vào tài khoản.', @label_hoc_tap, 'ctsv@university.edu.vn', @default_receiver),
('Lịch bảo vệ đồ án tốt nghiệp', 'Lịch bảo vệ đồ án tốt nghiệp đợt 1 đã được công bố. Sinh viên kiểm tra lịch và chuẩn bị slide thuyết trình.', @label_hoc_tap, 'daotao@university.edu.vn', @default_receiver);

-- ============================================
-- QUẢNG CÁO (Advertisement) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Giảm giá 50% Black Friday', 'Chương trình Black Friday siêu khủng! Giảm giá lên đến 50% cho tất cả sản phẩm. Chỉ trong 3 ngày duy nhất!', @label_quang_cao, 'marketing@tiki.vn', @default_receiver),
('Khóa học lập trình miễn phí', 'Đăng ký ngay khóa học lập trình Python miễn phí. Học online, cấp chứng chỉ. Số lượng có hạn, đăng ký ngay!', @label_quang_cao, 'info@unica.vn', @default_receiver),
('Ưu đãi thẻ tín dụng mới', 'Mở thẻ tín dụng ngay hôm nay, nhận ngay 500.000đ và miễn phí năm đầu tiên. Ưu đãi có hạn!', @label_quang_cao, 'promo@techcombank.com.vn', @default_receiver),
('Mua 1 tặng 1 pizza', 'Chương trình mua 1 tặng 1 pizza size L. Áp dụng từ thứ 2 đến thứ 5 hàng tuần. Đặt hàng ngay!', @label_quang_cao, 'order@pizzahut.vn', @default_receiver),
('Khuyến mãi du lịch Phú Quốc', 'Tour du lịch Phú Quốc 3N2Đ chỉ từ 3.999.000đ. Bao gồm vé máy bay, khách sạn 4 sao. Đặt ngay!', @label_quang_cao, 'booking@travel.vn', @default_receiver),
('Giảm giá iPhone 15 Pro', 'iPhone 15 Pro giảm giá sốc 5 triệu đồng. Trả góp 0% lãi suất. Số lượng có hạn, mua ngay kẻo lỡ!', @label_quang_cao, 'sales@thegioididong.com', @default_receiver),
('Khóa học tiếng Anh online', 'Học tiếng Anh giao tiếp online với giáo viên bản ngữ. Giảm 30% học phí khi đăng ký trong tháng này.', @label_quang_cao, 'contact@elsa.vn', @default_receiver),
('Ưu đãi gói gym 12 tháng', 'Đăng ký gói tập gym 12 tháng, tặng 2 tháng và 10 buổi PT miễn phí. Ưu đãi chỉ trong tuần này!', @label_quang_cao, 'membership@californiafitness.com.vn', @default_receiver),
('Flash sale laptop gaming', 'Flash sale laptop gaming giảm đến 40%. Cấu hình khủng, giá cực tốt. Sale kết thúc sau 24h!', @label_quang_cao, 'flashsale@fptshop.com.vn', @default_receiver),
('Bảo hiểm sức khỏe ưu đãi', 'Mua bảo hiểm sức khỏe ngay hôm nay, giảm 20% phí bảo hiểm năm đầu. Bảo vệ sức khỏe gia đình bạn!', @label_quang_cao, 'care@baoviet.com.vn', @default_receiver);

-- ============================================
-- SPAM - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Bạn đã trúng giải 500 triệu', 'Chúc mừng! Bạn đã trúng giải đặc biệt 500 triệu đồng. Nhấp vào đây để nhận thưởng ngay. Nhanh tay kẻo lỡ!', @label_spam, 'noreply@fake-lottery.com', @default_receiver),
('Kiếm tiền online tại nhà', 'Kiếm 10-20 triệu/tháng chỉ với 2h làm việc mỗi ngày. Không cần kinh nghiệm. Đăng ký ngay để nhận hướng dẫn!', @label_spam, 'info@scam-money.net', @default_receiver),
('Tài khoản của bạn bị khóa', 'CẢNH BÁO: Tài khoản ngân hàng của bạn đã bị khóa. Nhấp vào đây để xác thực lại thông tin ngay!', @label_spam, 'alert@fake-bank.com', @default_receiver),
('Thuốc giảm cân thần thánh', 'Giảm 10kg chỉ trong 1 tuần với viên uống giảm cân thần thánh. An toàn, hiệu quả. Đặt hàng ngay!', @label_spam, 'sales@miracle-pills.xyz', @default_receiver),
('Bạn có 1 tin nhắn mới', 'Bạn có 1 tin nhắn mới từ người lạ. Nhấp vào đây để đọc tin nhắn. Có thể là người yêu cũ của bạn!', @label_spam, 'message@suspicious-site.com', @default_receiver),
('Cơ hội đầu tư sinh lời 300%', 'Đầu tư 10 triệu, nhận về 30 triệu sau 1 tháng. Cơ hội có 1-0-2. Liên hệ ngay để được tư vấn!', @label_spam, 'invest@ponzi-scheme.net', @default_receiver),
('Xác nhận đơn hàng #12345', 'Đơn hàng #12345 của bạn đang chờ xác nhận. Nhấp vào đây để xác nhận và thanh toán 5.000.000đ.', @label_spam, 'order@fake-shop.com', @default_receiver),
('Bạn được tặng iPhone 15', 'Chúc mừng! Bạn được chọn ngẫu nhiên để nhận iPhone 15 miễn phí. Điền thông tin để nhận quà ngay!', @label_spam, 'prize@phishing-site.xyz', @default_receiver),
('Cảnh báo virus máy tính', 'Máy tính của bạn đã bị nhiễm 5 virus nguy hiểm. Tải phần mềm diệt virus ngay để bảo vệ dữ liệu!', @label_spam, 'warning@malware-site.com', @default_receiver),
('Làm giàu không cần vốn', 'Bí quyết làm giàu không cần vốn. Chỉ cần 30 phút mỗi ngày. Nhấp vào đây để nhận ebook miễn phí!', @label_spam, 'ebook@get-rich-quick.net', @default_receiver);

-- ============================================
-- GIAO DỊCH (Transaction) - 10 emails
-- ============================================

INSERT INTO tblEmail (title, content, tbl_label_id, sender, receiver) VALUES
('Xác nhận giao dịch chuyển khoản', 'Giao dịch chuyển khoản 5.000.000đ đến tài khoản 123456789 đã thành công vào lúc 10:00 AM ngày 27/10/2025.', @label_giao_dich, 'notify@vietcombank.com.vn', @default_receiver),
('Thông báo nạp tiền vào ví điện tử', 'Bạn đã nạp thành công 1.000.000đ vào ví điện tử của mình vào ngày 26/10/2025. Số dư hiện tại là 2.500.000đ.', @label_giao_dich, 'noreply@momo.vn', @default_receiver),
('Hóa đơn thanh toán dịch vụ internet', 'Hóa đơn thanh toán dịch vụ internet tháng 10/2025 với số tiền 300.000đ đã được ghi nhận. Vui lòng kiểm tra chi tiết.', @label_giao_dich, 'billing@fpt.vn', @default_receiver),
('Xác nhận mua hàng trực tuyến', 'Đơn hàng #56789 của bạn với tổng giá trị 2.000.000đ đã được xác nhận và sẽ được giao trong vòng 3-5 ngày làm việc.', @label_giao_dich, 'orders@shopee.vn', @default_receiver),
('Thông báo rút tiền từ tài khoản ngân hàng', 'Yêu cầu rút tiền 1.500.000đ từ tài khoản ngân hàng của bạn đã được xử lý thành công vào ngày 25/10/2025.', @label_giao_dich, 'alert@techcombank.com.vn', @default_receiver),
('Báo cáo sao kê tài khoản tháng 10', 'Báo cáo sao kê tài khoản ngân hàng của bạn cho tháng 10/2025 đã sẵn sàng. Vui lòng đăng nhập để xem chi tiết giao dịch.', @label_giao_dich, 'statement@vietcombank.com.vn', @default_receiver),
('Xác nhận thanh toán hóa đơn điện nước', 'Thanh toán hóa đơn điện nước tháng 10/2025 với số tiền 450.000đ đã được ghi nhận vào ngày 24/10/2025.', @label_giao_dich, 'billing@evn.vn', @default_receiver),
('Thông báo hoàn tiền giao dịch', 'Giao dịch mua hàng #67890 đã được hoàn tiền 500.000đ vào tài khoản của bạn do lỗi kỹ thuật. Vui lòng kiểm tra số dư.', @label_giao_dich, 'refund@lazada.vn', @default_receiver),
('Cảnh báo giao dịch bất thường', 'Chúng tôi phát hiện giao dịch chuyển khoản 10.000.000đ từ tài khoản của bạn vào ngày 23/10/2025 có dấu hiệu bất thường. Vui lòng liên hệ ngay.', @label_giao_dich, 'security@vietcombank.com.vn', @default_receiver),
('Xác nhận đăng ký dịch vụ mới', 'Bạn đã đăng ký thành công dịch vụ bảo hiểm sức khỏe với phí hàng tháng là 200.000đ bắt đầu từ ngày 01/11/2025.', @label_giao_dich, 'service@baoviet.com.vn', @default_receiver);

-- ============================================
-- VERIFY DATA
-- ============================================

-- Count emails by label
SELECT 
    l.name AS 'Label',
    COUNT(e.id) AS 'Email Count'
FROM tblLabel l
LEFT JOIN tblEmail e ON l.id = e.tbl_label_id
GROUP BY l.id, l.name
ORDER BY l.name;

-- Display summary
SELECT 
    'Total Labels' AS 'Metric',
    COUNT(*) AS 'Count'
FROM tblLabel
UNION ALL
SELECT 
    'Total Emails' AS 'Metric',
    COUNT(*) AS 'Count'
FROM tblEmail;


