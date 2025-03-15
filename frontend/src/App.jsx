import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/dashboard/UserManagement";
import RoomManagement from "./pages/dashboard/RoomManagement";
import UploadImages from "./pages/dashboard/UploadImages";

function App() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage setUsername={setUsername} setRole={setRole} />}
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              username={username}
              role={role}
              setUsername={setUsername}
              setRole={setRole}
            />
          }
        />
        <Route
          path="/user"
          element={
            <UserDashboard
              username={username}
              role={role}
              setUsername={setUsername}
              setRole={setRole}
            />
          }
        />
        <Route
          path="/admin/usermanagement"
          element={
            <UserManagement setUsername={setUsername} setRole={setRole} />
          }
        />
        <Route
          path="/admin/roommanagement"
          element={
            <RoomManagement setUsername={setUsername} setRole={setRole} />
          }
        />
        <Route
          path="/admin/uploadimages"
          element={<UploadImages setUsername={setUsername} setRole={setRole} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
