import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard({ username, role, setUsername, setRole }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUsername("");  
    setRole("");  

    alert("ออกจากระบบเรียบร้อย!");
    navigate("/");
  }
  function handleUsermanagement(){
    axios.get("http://localhost:5000/admin/usermanagement",{withCredentials: true})
    .then(response=> {
      console.log("User Data:",response.data.users);
      navigate("/admin/usermanagement")
    })
    .catch(error => {
      console.error("Error fetching user data:",error);
    });
  }

  function handleRoommanagement(){
    console.log("ABC")
    navigate("/admin/roommanagement")
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>ยินดีต้อนรับ, {username || "ผู้ดูแลระบบ"} 🎉</p>
      <p>Role: {role}</p>
      <button onClick={handleUsermanagement}>User Management</button>
      <button onClick={handleRoommanagement}>Room Management</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}


export default AdminDashboard;
