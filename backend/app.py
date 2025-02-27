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
        return jsonify({"status": "success", "users": all_users})  # ✅ เปลี่ยน "user" เป็น "users"
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
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    room_data_query = """
        SELECT 
            r.id AS room_id,
            r.name AS room_name,
            COALESCE(uu.electricity_usage, 0) AS electricity_usage,
            COALESCE(uu.water_usage, 0) AS water_usage,
            COALESCE(u.firstname, 'ไม่มีข้อมูล') AS firstname,
            COALESCE(u.lastname, '') AS lastname,
            COALESCE(u.username, 'ไม่มีผู้ใช้') AS username
        FROM rooms r
        LEFT JOIN tenant t ON r.id = t.room_id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN utility_usage uu ON r.id = uu.room_id 
        AND uu.month = (SELECT MAX(month) FROM utility_usage WHERE room_id = r.id);
    """
    try:
        cursor.execute(room_data_query)
        all_room_data = cursor.fetchall()
        print("ข้อมูลห้องที่ดึงมา:", all_room_data)

        return jsonify({"status": "success", "rooms": all_room_data})

    except Exception as e:
        print("ERROR ใน API /admin/roommanagement:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



if __name__ == "__main__":
    app.run(debug=True, port=5000)
