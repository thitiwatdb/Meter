import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage({ setUsername, setRole }) {
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleLogin() {
    console.log("Logging in with:", inputUsername, password);
    axios
      .post(
        "http://localhost:5000/login",
        { username: inputUsername, password },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data.status === "success") {
          alert("ล็อกอินสำเร็จ");

          localStorage.setItem("username", response.data.username);
          localStorage.setItem("role", response.data.role);

          setUsername(response.data.username);
          setRole(response.data.role);

          if (response.data.role === "admin") {
            navigate("/admin");
            console.log("Navigating to admin");
          } else {
            navigate("/user");
            console.log("Navigating to user");
          }
        }
      })
      .catch((error) => {
        console.error(
          "Login failed:",
          error.response ? error.response.data : error.message
        );
        setMessage("Login failed. Please check your username and password.");
        alert("ล็อกอินไม่สำเร็จ")
      });
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Back to Home Button */}
        <div className="py-4 flex justify-center"></div>

        <div className="flex min-h-[80vh] items-center justify-center flex-col space-y-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg ">
            <div className="flex justify-center ">Logo</div>
            <div className="font-bold tracking-wider text-indigo-600 text-center ">
              <h1 className="text-4xl">Login</h1>
            </div>

            <div className="space-y-4 rounded-md">
              <div className="block text-sm font-medium text-gray-700 mb-5 ">
                <input
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 "
                  type="text"
                  placeholder="Username"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                />
              </div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                <input
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 "
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleLogin}
                className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
