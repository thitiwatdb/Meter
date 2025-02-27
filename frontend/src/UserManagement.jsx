import { useState, useEffect } from "react";
import axios from "axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null); // ✅ ID ของ User ที่กำลังแก้ไข
  const [newPassword, setNewPassword] = useState(""); // ✅ เก็บค่ารหัสผ่านใหม่ที่พิมพ์


  

  useEffect(() => {
    axios.get("http://localhost:5000/admin/usermanagement", { withCredentials: true })
      .then(response => {
        console.log("User Data:", response.data);
        setUsers(response.data.users || []);  // ✅ ป้องกัน users เป็น undefined
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleEdit(userId) {
    setEditingUserId(userId);  // ✅ เก็บ ID ของ User ที่ต้องการแก้ไข
  }

  function handleSave(){
    axios.post("http://localhost:5000/admin/updatepassword",{
        id: editingUserId,
        newPassword: newPassword
    },{withCredentials: true})
    .then(response => {
        console.log("Password updated:", response.data);
        alert("เปลี่ยนรหัสผ่านสำเร็จ");
        setEditingUserId(null);
        setNewPassword("");
    })
    .catch(error => {
        console.error("Error updating password",error);
        alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    })
  }

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>User Management</h1>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {users?.length > 0 ? (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                    {editingUserId === user.id ? (
                        <>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setEditingUserId(null)}>Cancel</button>
                        </>
                    ):(
                        <button onClick={() => handleEdit(user.id)}>Edit</button>
                    )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>ไม่มีข้อมูลผู้ใช้</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
