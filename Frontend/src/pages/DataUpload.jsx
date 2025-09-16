import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "./DataUpload.css";

const DataUpload = () => {
  const [file, setFile] = useState(null);
  const [isFaculty, setIsFaculty] = useState(true); // role check
  const [uploadHistory, setUploadHistory] = useState([]); // store uploaded files

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle upload
  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      fileName: file.name,
      date: new Date().toLocaleString(),
      status: "Pending Review",
    };

    setUploadHistory([newEntry, ...uploadHistory]);
    setFile(null);
    alert(`File "${file.name}" uploaded successfully!`);
  };

  // Handle delete
  const handleDelete = (id) => {
    const updatedHistory = uploadHistory.filter((item) => item.id !== id);
    setUploadHistory(updatedHistory);
  };

  // Handle modify (simulate by renaming status)
  const handleModify = (id) => {
    const updatedHistory = uploadHistory.map((item) =>
      item.id === id ? { ...item, status: "Modified & Re-Submitted" } : item
    );
    setUploadHistory(updatedHistory);
  };

  if (!isFaculty) {
    return <h2 className="no-access">❌ You do not have permission to upload data.</h2>;
  }

  return (
    <div>
      <Navbar />
      <div className="upload-container">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="upload-form">
          <input type="file" onChange={handleFileChange} className="file-input" />
          <button type="submit" className="upload-btn">Upload</button>
        </form>

        {/* Upload History */}
        <div className="history-container">
          <h3>Upload History</h3>
          {uploadHistory.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Date Uploaded</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fileName}</td>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                    <td>
                      <button
                        className="modify-btn"
                        onClick={() => handleModify(item.id)}
                      >
                        Modify
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataUpload;