import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("home");

  // Example institution data
  const institutions = [
    {
      name: "Heritage Institute of Technology",
      departments: 12,
      faculty: 320,
      students: 4500,
      papers: 280,
    },
    {
      name: "Techno India University",
      departments: 15,
      faculty: 400,
      students: 6000,
      papers: 350,
    },
    {
      name: "IEM - Institute of Engineering & Management",
      departments: 10,
      faculty: 250,
      students: 4200,
      papers: 200,
    },
    {
      name: "Jadavpur University",
      departments: 25,
      faculty: 900,
      students: 12000,
      papers: 800,
    },
    {
      name: "Amity University Kolkata",
      departments: 18,
      faculty: 500,
      students: 7500,
      papers: 420,
    },
    {
      name: "St. Xavier's College Kolkata",
      departments: 8,
      faculty: 180,
      students: 3500,
      papers: 150,
    },
  ];

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        {/* CHANGED HERE */}
        <h2>Annual Report Portal</h2>
        <ul>
          <li
            onClick={() => setActivePage("home")}
            className={activePage === "home" ? "active" : ""}
          >
            Home
          </li>
          <li
            onClick={() => setActivePage("profile")}
            className={activePage === "profile" ? "active" : ""}
          >
            Profile
          </li>
          <li
            onClick={() => setActivePage("academics")}
            className={activePage === "academics" ? "active" : ""}
          >
            Academics
          </li>
          <li
            onClick={() => setActivePage("reports")}
            className={activePage === "reports" ? "active" : ""}
          >
            Reports
          </li>
          <li
            onClick={() => setActivePage("settings")}
            className={activePage === "settings" ? "active" : ""}
          >
            Settings
          </li>
        </ul>
        <button className="logout-btn">Logout</button>
      </nav>

      {/* Page Sections */}
      {activePage === "home" && (
        <div>
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search Institution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Institutions */}
          <div className="institutions">
            {filteredInstitutions.length > 0 ? (
              filteredInstitutions.map((inst, index) => (
                <div key={index} className="institution-card">
                  <h2>{inst.name}</h2>
                  <div className="stats">
                    <div className="card">
                      <h3>Departments</h3>
                      <p>{inst.departments}</p>
                    </div>
                    <div className="card">
                      <h3>Faculty</h3>
                      <p>{inst.faculty}</p>
                    </div>
                    <div className="card">
                      <h3>Students</h3>
                      <p>{inst.students}</p>
                    </div>
                    <div className="card">
                      <h3>Research Papers</h3>
                      <p>{inst.papers}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">❌ No Institution Found</p>
            )}
          </div>
        </div>
      )}

      {activePage === "profile" && (
        <div className="page-content">
          <h2>👤 User Profile</h2>
          <p>Name: John Doe</p>
          <p>Role: Admin</p>
          <p>Email: john@example.com</p>
        </div>
      )}

      {activePage === "academics" && (
        <div className="page-content">
          <h2>📘 Academics Overview</h2>
          <p>
            Track academic performance, grades, and department-wise reports here.
          </p>
        </div>
      )}

      {activePage === "reports" && (
        <div className="page-content">
          <h2>📊 Reports Section</h2>
          <p>Generate and download annual reports here.</p>
        </div>
      )}

      {activePage === "settings" && (
        <div className="page-content">
          <h2>⚙️ Settings</h2>
          <p>Manage account preferences, password, and system configurations.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
