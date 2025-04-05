import React, { useState, useEffect } from "react";

export default function UploadImages() {
  const [images, setImages] = useState([]);
  const [imagesURL, setImagesURL] = useState([]);
  const [detectionResults, setDetectionResults] = useState({});
  const [meterType, setMeterType] = useState("water"); 
  const [roomCode, setRoomCode] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [confirmStatus, setConfirmStatus] = useState("");

  useEffect(() => {
    if (images.length < 1) return;
    const newImagesURL = images.map((image) => URL.createObjectURL(image));
    setImagesURL(newImagesURL);
    setDetectionResults({});
    images.forEach((image) => {
      handleDetect(image);
    });
  }, [images]);

  async function handleDetect(image) {
    const formData = new FormData();
    formData.append("image", image);
    try {
      const response = await fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setDetectionResults((prevResults) => ({
        ...prevResults,
        [image.name]: data.detections,
      }));
    } catch (error) {
      console.error("Error during detection:", error);
    }
  }

  async function handleConfirm() {
    if (images.length === 0) {
      alert("กรุณาอัปโหลดรูปภาพ");
      return;
    }
    const firstImage = images[0];
    const detection = detectionResults[firstImage.name];
    if (!detection) {
      alert("ยังไม่มีผลลัพธ์จากการตรวจจับ");
      return;
    }
    const readingValue = detection.numeric_value;
    if (readingValue === null || readingValue === undefined) {
      alert("ไม่สามารถดึงค่าจากการตรวจจับได้");
      return;
    }
    if (!roomCode || !recordDate) {
      alert("กรุณาระบุรหัสห้องและวันที่");
      return;
    }

    const payload = {
      room_code: roomCode,
      meter_type: meterType,
      record_date: recordDate,
      reading_value: readingValue,
    };

    try {
      const response = await fetch("http://localhost:5000/insert_reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setConfirmStatus(data.message);
    } catch (error) {
      console.error("Error inserting reading:", error);
      setConfirmStatus("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  }

  function onImageChange(e) {
    setImages([...e.target.files]);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="text-2xl m-5 font-bold text-blue-500">Upload Images</h1>
      <div className="p-4 bg-blue-200 shadow-md rounded-md">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageChange}
          className="p-4 shadow-md rounded-md bg-white text-blue-500"
        />
      </div>
      <div className="p-10 bg-white shadow-md rounded-md w-96 mt-4">
        {imagesURL.map((imageURL, index) => {
          const fileName = images[index].name;
          const result = detectionResults[fileName];
          return (
            <div key={index} className="mb-4">
              <img src={imageURL} alt="preview" className="mb-2" />
              {result ? (
                <div>
                  <p>
                    <strong>Detected Labels:</strong>{" "}
                    {result.sorted_labels.join(", ")}
                  </p>
                  <p>
                    <strong>Concatenated:</strong> {result.concatenated_labels}
                  </p>
                  <p>
                    <strong>Numeric Value:</strong>{" "}
                    {result.numeric_value !== null
                      ? result.numeric_value
                      : "N/A"}
                  </p>
                </div>
              ) : (
                <p>Detecting</p>
              )}
            </div>
          );
        })}
      </div>

      {}
      <div className="mt-4 p-4 bg-gray-100 rounded-md w-96">
        <h2 className="text-xl font-bold mb-2">รายละเอียดมิเตอร์</h2>
        <div className="mb-2">
          <label className="mr-4">
            <input
              type="radio"
              name="meterType"
              value="water"
              checked={meterType === "water"}
              onChange={() => setMeterType("water")}
            />
            มิเตอร์น้ำ
          </label>
          <label>
            <input
              type="radio"
              name="meterType"
              value="electricity"
              checked={meterType === "electricity"}
              onChange={() => setMeterType("electricity")}
            />
            มิเตอร์ไฟ
          </label>
        </div>
        <div className="mb-2">
          <label>
            เลือกห้อง:{" "}
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="เช่น A101"
              className="border p-1 rounded"
            />
          </label>
        </div>
        <div className="mb-2">
          <label>
            วันที่:{" "}
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="border p-1 rounded"
            />
          </label>
        </div>
        <button
          onClick={handleConfirm}
          className="mt-2 p-2 bg-blue-500 text-white rounded"
        >
          ยืนยันข้อมูล
        </button>
        {confirmStatus && (
          <p className="mt-2 text-green-600 font-bold">{confirmStatus}</p>
        )}
      </div>
    </div>
  );
}
