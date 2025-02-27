import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage({ setUsername, setRole }) {
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleLogin() {
    axios
      .post(
        "http://localhost:5000/login",
        { username: inputUsername, password },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data.status === "success") {
          console.log("Navigating to admin");
          alert("ล็อกอินสำเร็จ");

          localStorage.setItem("username", response.data.username);
          localStorage.setItem("role", response.data.role);

          setUsername(response.data.username);
          setRole(response.data.role);

          if (response.data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        }
      })
      .catch(() => {});
  }

  return (
    <>
      <div className="mx-auto h-screen flex items-center justify-between p-4 bg-blue-400">
        <div
          className=" container flex-col items-center max-w-sm bg-blue-200 mx-auto rounded-xl shadow-lg outline-black p-30
      gap-x-4"
        >
          <div className=" flex justify-center p-4 text-">
            <input
              className=" text-center bg-white rounded mx-2"
              type="text"
              placeholder="Username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
            />
          </div>
          <div className=" flex justify-center p-4 bg">
            <input
              className=" text-center bg-white rounded "
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className=" flex items-center justify-center p-4">
            <button
              className="px-4 py-2 min-w-36 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer active:scale-120 transition-transform"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>

          <p>{message}</p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
