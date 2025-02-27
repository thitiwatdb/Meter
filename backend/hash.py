import bcrypt

plaintext_password = "1234"

# เข้ารหัส (Hash) รหัสผ่าน
hashed_password = bcrypt.hashpw(plaintext_password.encode("utf-8"), bcrypt.gensalt())

# แปลงเป็น string ถ้าต้องการบันทึกในฐานข้อมูล
hashed_password_str = hashed_password.decode("utf-8")

print("Hashed password:", hashed_password_str)
