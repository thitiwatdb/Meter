import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import jwt
import datetime
import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

SECRET_KEY = "mysecretkey"

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="123456789"
    )

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    print("abc:",data)

    if not username or not password:
        return jsonify({"status": "error", "message": "กรุณากรอก username และ password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("SELECT id, username, role, password FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        print("User data:", user)
        print("Request data:", data)

        if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            token = jwt.encode({
                "username": user["username"],
                "role": user["role"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm="HS256")

            response = make_response(jsonify({"status": "success", "username": user["username"], "role": user["role"]}))
            response.set_cookie("token", token, httponly=True, secure=True, samesite="Strict")
            return response
        else:
            return jsonify({"status": "error", "message": "ล็อกอินไม่สำเร็จ"}), 401

    finally:
        cursor.close()
        conn.close()

@app.route("/verify", methods=["GET"])
def verify_token():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({"status": "success", "username": decoded["username"], "role": decoded["role"]})
    except jwt.ExpiredSignatureError:
        return jsonify({"status": "error", "message": "Token หมดอายุ"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"status": "error", "message": "Token ไม่ถูกต้อง"}), 401

@app.route("/admin/usermanagement", methods=["GET"])
def show_user_data():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("SELECT id, username, role FROM users ORDER BY id ASC")
        all_users = cursor.fetchall()
        print("All users:", all_users)
        return jsonify({"status": "success", "users": all_users})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/admin/updatepassword", methods=["POST"])
def update_password():
    data = request.json
    user_id = data.get("id")
    new_password = data.get("newPassword")

    if not user_id or not new_password:
        return jsonify({"status": "error", "message": "กรุณากรอกข้อมูลให้ครบถ้วน"}), 400

    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        conn.commit()
        return jsonify({"status": "success", "message": "เปลี่ยนรหัสผ่านสำเร็จ!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/admin/roommanagement", methods=["GET"])
def get_room_data():
    month = request.args.get("month", "")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if month:  # ถ้าเลือกเดือน ให้กรองข้อมูลตามเดือนนั้น
        room_data_query = """
            SELECT 
                r.id AS room_id,
                r.room_code AS room_name,
                COALESCE(uu.electricity_reading, 0) AS electricity_usage,
                COALESCE(uu.water_reading, 0) AS water_usage,
                COALESCE(CONCAT(u.firstname, ' ', u.lastname), 'ไม่มีผู้เช่า') AS tenant_name
            FROM rooms r
            LEFT JOIN (
                SELECT room_id, electricity_reading, water_reading, record_date
                FROM utility_usage
                WHERE TO_CHAR(record_date, 'YYYY-MM') = %s
            ) uu ON r.id = uu.room_id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.id ASC;
        """
        cursor.execute(room_data_query, (month,))
    
    else:  # ถ้าเลือก "ทั้งหมด" ให้ดึงข้อมูลล่าสุดของแต่ละห้อง
        room_data_query = """
            SELECT 
                r.id AS room_id,
                r.room_code AS room_name,
                COALESCE(uu.electricity_reading, 0) AS electricity_usage,
                COALESCE(uu.water_reading, 0) AS water_usage,
                COALESCE(CONCAT(u.firstname, ' ', u.lastname), 'ไม่มีผู้เช่า') AS tenant_name
            FROM rooms r
            LEFT JOIN (
                SELECT DISTINCT ON (room_id) room_id, electricity_reading, water_reading, record_date
                FROM utility_usage
                ORDER BY room_id, record_date DESC
            ) uu ON r.id = uu.room_id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.id ASC;
        """
        cursor.execute(room_data_query)

    all_room_data = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify({"status": "success", "rooms": all_room_data})


@app.route("/admin/adduser", methods=["POST"])
def add_user():
    data = request.json
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not firstname or not lastname or not username or not password or not role:
        return jsonify({"status": "error", "message": "กรุณากรอกข้อมูลให้ครบถ้วน (firstname, lastname, username, password, role)"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "ผู้ใช้มีอยู่แล้ว"}), 400

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute(
            "INSERT INTO users (firstname, lastname, username, role, password) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (firstname, lastname, username, role, hashed_password)
        )
        new_user = cursor.fetchone()
        conn.commit()
        return jsonify({
            "status": "success",
            "message": "เพิ่มผู้ใช้สำเร็จ",
            "user_id": new_user["id"]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



@app.route("/admin/deleteuser", methods=["DELETE"])
def delete_user():
    data = request.json
    user_id = data.get("id")
    
    if not user_id:
        return jsonify({"status": "error", "message": "กรุณาระบุรหัสผู้ใช้ (id) ที่ต้องการลบ"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "ไม่พบผู้ใช้ที่มีรหัสนี้"}), 404
        return jsonify({"status": "success", "message": "ลบผู้ใช้สำเร็จ"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
