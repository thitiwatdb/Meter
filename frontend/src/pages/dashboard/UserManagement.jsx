import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [addFirstname, setAddFirstname] = useState("");
  const [addLastname, setAddLastname] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("");
  const navigate = useNavigate();

  function fetchUsers() {
    setLoading(true);
    axios
      .get("http://localhost:5000/admin/usermanagement", { withCredentials: true })
      .then((response) => {
        console.log("User Data:", response.data);
        setUsers(response.data.users || []);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleEdit(userId) {
    setEditingUserId(userId);
    setNewPassword("");
  }

  function handleSave() {
    if (!newPassword.trim()) {
      alert("กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    axios
      .post(
        "http://localhost:5000/admin/updatepassword",
        {
          id: editingUserId,
          newPassword: newPassword,
        },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("Password updated:", response.data);
        alert("เปลี่ยนรหัสผ่านสำเร็จ");
        setEditingUserId(null);
        setNewPassword("");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error updating password", error);
        alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      });
  }

  function handleAddUser(e) {
    e.preventDefault();
    if (!addFirstname || !addLastname || !addUsername || !addPassword || !addRole) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    axios
      .post(
        "http://localhost:5000/admin/adduser",
        {
          firstname: addFirstname,
          lastname: addLastname,
          username: addUsername,
          password: addPassword,
          role: addRole,
        },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("User added:", response.data);
        alert("เพิ่มผู้ใช้สำเร็จ");
        setAddFirstname("");
        setAddLastname("");
        setAddUsername("");
        setAddPassword("");
        setAddRole("");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error adding user", error);
        alert("เกิดข้อผิดพลาดในการเพิ่มผู้ใช้");
      });
  }

  function handleDeleteUser(userId) {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้รายนี้?")) {
      return;
    }

    axios
      .delete("http://localhost:5000/admin/deleteuser", {
        data: { id: userId },
        withCredentials: true,
      })
      .then((response) => {
        console.log("User deleted:", response.data);
        alert("ลบผู้ใช้สำเร็จ");
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error deleting user", error);
        alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
      });
  }

  if (loading) return <p>Loading</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>User Management</h1>
      <button onClick={() => navigate(-1)}>Back</button>

      <form onSubmit={handleAddUser}>
        <input type="text" placeholder="Name" value={addFirstname} onChange={(e) => setAddFirstname(e.target.value)} />
        <input type="text" placeholder="Surname" value={addLastname} onChange={(e) => setAddLastname(e.target.value)} />
        <input type="text" placeholder="Username" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
        <select value={addRole} onChange={(e) => setAddRole(e.target.value)}>
          <option value="">Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button type="submit">Add User</button>
      </form>

      <h2>User</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Change Password</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {users?.length > 0 ? (
            users.map((user) => (
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
                      <button onClick={() => setEditingUserId(null)}>Cancle</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(user.id)}>Change Password</button>
                  )}
                </td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>ไม่มีข้อมูลผู้ใช้</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
