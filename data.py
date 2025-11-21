import imaplib
import email
from email.header import decode_header
from bs4 import BeautifulSoup
import csv
import os
import re

# --- Thông tin đăng nhập ---
imap_host = "imap.gmail.com"
username = "nguyenthithuoanh01112004@gmail.com"
password = "vyht hsmn dflu vxmm"  # App Password

# --- Kết nối Gmail IMAP ---
mail = imaplib.IMAP4_SSL(imap_host)
mail.login(username, password)

# Chọn hộp thư INBOX
mail.select("inbox")

# Lấy toàn bộ email ID
status, messages = mail.search(None, "ALL")
email_ids = messages[0].split()
print(f"📌 Tổng số email trong hộp thư: {len(email_ids)}")

emails = []

# Regex để phát hiện link
url_pattern = re.compile(r'https?://\S+|www\.\S+')

# --- Các từ khóa để bỏ qua email không cần ---
blacklist_senders = ["facebook"]

# Duyệt từng email
for e_id in email_ids:
    status, msg_data = mail.fetch(e_id, "(RFC822)")
    for response_part in msg_data:
        if isinstance(response_part, tuple):
            msg = email.message_from_bytes(response_part[1])

            # --- Người gửi ---
            from_ = msg.get("From", "").lower()

            # Bỏ qua nếu email được gửi từ Facebook
            if any(word in from_ for word in blacklist_senders):
                continue

            # --- Tiêu đề (title) ---
            subject, encoding = decode_header(msg.get("Subject"))[0] if msg.get("Subject") else ("", None)
            if isinstance(subject, bytes):
                try:
                    subject = subject.decode(encoding or "utf-8", errors="ignore")
                except:
                    subject = subject.decode("utf-8", errors="ignore")
            subject = subject.strip()

            # --- Nội dung (context) ---
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    ctype = part.get_content_type()
                    if ctype == "text/plain" and part.get("Content-Disposition") is None:
                        try:
                            part_body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                        except:
                            part_body = part.get_payload()
                        body += part_body + "\n"
            else:
                try:
                    body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
                except:
                    body = msg.get_payload()

            # Làm sạch HTML nếu có
            if msg.get_content_type() == "text/html":
                soup = BeautifulSoup(body, "html.parser")
                body = soup.get_text()

            # Xóa dòng trống thừa
            body_lines = [line.strip() for line in body.splitlines() if line.strip()]
            body_clean = " ".join(body_lines)

            # Bỏ email có link
            if url_pattern.search(body_clean):
                continue

            # Giữ nội dung ngắn (tối đa 300 ký tự)
            if len(body_clean) > 300:
                body_clean = body_clean[:300] + "..."

            # Bỏ email trống
            if not body_clean:
                continue

            emails.append({
                "title": subject,
                "context": body_clean
            })
