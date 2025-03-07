import { useState, useEffect } from "react";
import axios from "axios";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);  // ✅ ใช้เก็บข้อมูลห้องที่ดึงมา
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/admin/roommanagement", { withCredentials: true })
      .then(response => {
        console.log("Room Data:", response.data);
        setRooms(response.data.rooms || []);  // ✅ เปลี่ยนจาก `users` → `rooms`
      })
      .catch(error => {
        console.error("Error fetching room data:", error);
        setError("ไม่สามารถโหลดข้อมูลห้องพักได้");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Room Management</h1>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Room Name</th>
            <th>Electricity Usage</th>
            <th>Water Usage</th>
            <th>Tenant Name</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length > 0 ? (
            rooms.map(room => (
              <tr key={room.room_id}>
                <td>{room.room_id}</td>
                <td>{room.room_name}</td>
                <td>{room.electricity_usage}</td>
                <td>{room.water_usage}</td>
                <td>{room.firstname ? `${room.firstname} ${room.lastname}` : "ไม่มีผู้เช่า"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>ไม่มีข้อมูลห้องพัก</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RoomManagement;
