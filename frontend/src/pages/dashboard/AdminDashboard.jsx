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
  function handleUsermanagement() {
    axios
      .get("http://localhost:5000/admin/usermanagement", {
        withCredentials: true,
      })
      .then((response) => {
        console.log("User Data:", response.data.users);
        navigate("/admin/usermanagement");
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  function handleRoommanagement() {
    console.log("ABC");
    navigate("/admin/roommanagement");
  }

  function handleUploadimages() {
    navigate("/admin/uploadimages");
  }

  return (
    <>
      <div className="flex flex-col justify-center m-2">
        <div className="container mx-auto">
          <div className="p-5 bg-blue-700 shadow-md rounded-md">
            <h1 className="text-2xl text-white font-bold">Admin Dashboard</h1>
          </div>
          <div className="m-1 p-2 bg-white shadow-md rounded-md flex flex-row justify-between text-blue-500">
            <div className="font-bold">
              <h1>ยินดีต้อนรับ, {username || "ผู้ดูแลระบบ"} </h1>
              <h1>Role: {role}</h1>
            </div>
            <div className="grid grid-cols-4 gap-5 text-xl text-blue-500">
              <button
                className=" hover:animate-bounce hover:text-blue-800"
                onClick={handleUsermanagement}
              >
                User Management
              </button>
              <button
                className="hover:animate-bounce hover:text-blue-800"
                onClick={handleRoommanagement}
              >
                Room Management
              </button>
              <button
                className="hover:animate-bounce hover:text-blue-800"
                onClick={handleUploadimages}
              >
                Upload
              </button>
              <button
                className=" hover:animate-bounce hover:text-blue-800"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className=" container m-10">
          <div className="text-center">Dashboard</div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
