import React, { useState } from "react";
import "./DataUpload.css";
import Navbar from "../components/FacultyNavbar";// importing your navbar

export default function DataUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload!");
      return;
    }
    alert(`File "${file.name}" uploaded successfully!`);
  };

  return (
    <div className="upload-container">
      <Navbar />

      <div className="upload-box">
        <h1 className="upload-title">Data Upload</h1>
        <p className="upload-subtitle">
          Upload and manage your annual report data
        </p>

        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Title */}
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter a descriptive title"
            required
          />

          {/* Category */}
          <label>Category</label>
          <select required>
            <option value="">Select a category</option>
            <option value="documents">Documents</option>
            <option value="spreadsheets">Spreadsheets</option>
            <option value="presentations">Presentations</option>
            <option value="images">Images</option>
          </select>

          {/* Description */}
          <label>Description</label>
          <textarea
            placeholder="Provide additional details about the data"
            rows="3"
          ></textarea>

          {/* Tags */}
          <label>Tags</label>
          <input type="text" placeholder="Add a tag" />

          {/* File Upload */}
          <div
            className="file-drop"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <p>Drop files here or click to browse</p>
            <small>PDF, DOC, XLS, PPT, Images up to 10MB each</small>
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {file && <p className="file-name">📄 {file.name}</p>}

          {/* Submit */}
          <button type="submit" className="upload-btn">
            Upload File
          </button>
        </form>

        {/* Guidelines */}
        <aside className="guidelines">
          <h3>Upload Guidelines</h3>
          <p><strong>Supported Formats</strong></p>
          <ul>
            <li>Documents: PDF, DOC, DOCX</li>
            <li>Spreadsheets: XLS, XLSX</li>
            <li>Presentations: PPT, PPTX</li>
            <li>Images: JPG, PNG, GIF</li>
          </ul>
          <p><strong>Best Practices</strong></p>
          <ul>
            <li>Use descriptive file names</li>
            <li>Keep files under 10MB</li>
            <li>Add relevant tags</li>
            <li>Include detailed descriptions</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}