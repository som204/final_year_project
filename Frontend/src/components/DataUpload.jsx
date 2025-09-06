import React, { useState } from "react";
import "./DataUpload.css";

function DataUpload() {
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      alert(`File "${file.name}" uploaded successfully ✅`);
    } else if (manualData.trim()) {
      alert("Manual data submitted successfully ✅");
    } else {
      alert("⚠️ Please upload a file or enter some data.");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">📂 Data Upload</h2>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="upload-form">
          {/* File Upload */}
          <div className="input-group">
            <label>Upload File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
            />
            {file && <p className="file-info">Selected: {file.name}</p>}
          </div>

          {/* Manual Data */}
          <div className="input-group">
            <label>Manual Data</label>
            <textarea
              rows="5"
              placeholder="Enter details manually..."
              value={manualData}
              onChange={(e) => setManualData(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="button-group">
            <button type="submit" className="btn primary-btn">
              Submit
            </button>
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => {
                setFile(null);
                setManualData("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DataUpload;
