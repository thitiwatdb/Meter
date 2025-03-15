import React from "react";
import { useState, useEffect } from "react";

export default function UploadImages() {
  const [images, setImages] = useState([]);
  const [imagesURL, setImagesURL] = useState([]);

  useEffect(() => {
    if (images.length < 1) return;
    const newImagesURL = [];
    images.forEach((image) => {
      newImagesURL.push(URL.createObjectURL(image));
    });
    setImagesURL(newImagesURL);
  }, [images]);

  function onImageChange(e) {
    setImages([...e.target.files]);
  }

  return (
    <>
      <div className=" flex flex-col items-center justify-center mt-10">
        <div className="p-4 bg-blue-400 shadow-md rounded-md">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageChange}
            className="p-4 shadow-md rounded-md bg-white"
          />
        </div>
        <div className="p-4 bg-white shadow-md rounded-md w-2xl mt-4">
          {imagesURL.map((imageURL, index) => (
            <img key={index} src={imageURL} alt="preview" />
          ))}
        </div>
      </div>
    </>
  );
}
