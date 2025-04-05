import { useNavigate } from "react-router-dom";

function UserDashboard({ username, role,setUsername,setRole }) {
  const navigate = useNavigate();
  function handleLogout(){
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUsername("");  
    setRole("");  

    alert("ออกจากระบบเรียบร้อย!");
    navigate("/");

  }
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>ยินดีต้อนรับ, {username || "ผู้ใช้ทั่วไป"} </p>
      <p>Role: {role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default UserDashboard;
