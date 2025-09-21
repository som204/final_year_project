import React, { useState,useContext } from 'react';
import '../pages/Faculty/InstituteFaculty.css'; // Reuse the faculty CSS for consistent styling
import { UserContext } from '../Context/user.context';

const DataUploadPage = () => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(UserContext);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Create a FormData object to handle file uploads
    const formData = new FormData();
    
    // Append the text description
    formData.append('description', description);

    // Append each selected file
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    // Append internal IDs. In a real app, these would come from the user's session or auth token.
    console.log(user)
    formData.append('faculty_id', parseInt(user.id)); // Dummy Faculty ID
    formData.append('department_id', parseInt(user.department_id)); // Dummy Department ID
    formData.append('institute_id', parseInt(user.institute_id)); // Dummy Institute ID

    // Log the FormData contents for verification
    // console.log("Submitting FormData...");
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    
    try {
      
      const response = await fetch('http://localhost:8000/uploads', {
        credentials:"include",
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        console.log(data);
        throw new Error(data.message || 'File upload failed.');
      }
      // console.log('Upload successful!', data);
      setSuccess(`${files.length} file(s) uploaded successfully!`);
      setDescription('');
      setFiles([]);
      e.target.reset(); // Clear the file input
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(()=>{
        setSuccess(null)
      },5000);
    }
  };

  return (
    <div className="faculty-page-content">
      <h1>Upload Data</h1>
      <p className="page-subheading">Upload research papers, datasets, reports, and other relevant documents.</p>

      {/* The form tag does not need a special enctype; FormData handles it */}
      <form onSubmit={handleSubmit} className="faculty-form">
        <textarea 
          name="description" 
          placeholder="Provide a detailed description of the uploaded file(s)..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          required 
        />
        <div className="file-input-container">
          <label htmlFor="file-upload">Choose Files</label>
          <input 
            id="file-upload"
            type="file" 
            name="files" 
            onChange={handleFileChange}
            multiple // Allow multiple files to be selected
            required 
          />
          <span className="file-input-label">
            {files.length > 0 ? `${files.length} file(s) selected` : "No file chosen"}
          </span>
        </div>
        
        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}
        
        <button type="submit" className="button button-accent" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload Files'}
        </button>
      </form>
    </div>
  );
};

export default DataUploadPage;