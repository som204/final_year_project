import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";

function Dashboard() {
  const [search, setSearch] = useState("");

  // Sample growth data for multiple years
  const institutions = [
    {
      name: "Heritage Institute of Technology",
      yearly: [
        { year: 2021, students: 3800, papers: 200 },
        { year: 2022, students: 4200, papers: 240 },
        { year: 2023, students: 4500, papers: 280 },
      ],
      faculty: 320,
      reviews: [
        "Great faculty and infrastructure!",
        "Excellent research opportunities.",
        "Campus life is amazing 🎉",
      ],
    },
    {
      name: "Techno India University",
      yearly: [
        { year: 2021, students: 5200, papers: 280 },
        { year: 2022, students: 5600, papers: 310 },
        { year: 2023, students: 6000, papers: 350 },
      ],
      faculty: 400,
      reviews: [
        "Vast campus with many activities.",
        "Good placement record overall.",
        "Needs improvement in hostel facilities.",
      ],
    },
    {
      name: "IEM - Institute of Engineering & Management",
      yearly: [
        { year: 2021, students: 3600, papers: 150 },
        { year: 2022, students: 3900, papers: 170 },
        { year: 2023, students: 4200, papers: 200 },
      ],
      faculty: 250,
      reviews: [
        "Friendly professors and staff.",
        "Strict but helpful academic environment.",
        "Good balance of academics and extracurriculars.",
      ],
    },
    {
      name: "Jadavpur University",
      yearly: [
        { year: 2021, students: 11000, papers: 700 },
        { year: 2022, students: 11500, papers: 760 },
        { year: 2023, students: 12000, papers: 800 },
      ],
      faculty: 900,
      reviews: [
        "Top-ranked university in Kolkata.",
        "Research-driven culture is excellent.",
        "Amazing alumni network 👏",
      ],
    },
  ];

  // Search filter
  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  const dataToShow =
    filteredInstitutions.length > 0 ? filteredInstitutions : institutions;

  const COLORS = ["#27ae60", "#2980b9", "#e67e22", "#8e44ad"];

  return (
    <div className="dashboard-container">
      {/* ✅ Navbar */}
      <nav className="navbar">
        <h2>Annual Report Portal</h2>
        <ul>
          <li>Home</li>
          <li>Profile</li>
          <li>Academics</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>
        <button className="logout-btn">Logout</button>
      </nav>

      {/* Header */}
      <header className="dashboard-header">
        <h2>📊 Institution Growth Dashboard</h2>
        <p>Separate analytics for each institution</p>
      </header>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search Institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Institution-wise cards */}
      <div className="institutions-container">
        {dataToShow.map((inst, idx) => {
          const latest = inst.yearly[inst.yearly.length - 1];
          const pieData = [
            { name: "Students", value: latest.students },
            { name: "Faculty", value: inst.faculty },
            { name: "Papers", value: latest.papers },
          ];

          return (
            <div className="institution-card" key={idx}>
              <h3>{inst.name}</h3>
              <div className="charts-row">
                {/* Bar Chart */}
                <div className="chart-card">
                  <h4>🎓 Students Growth</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={inst.yearly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#27ae60" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="chart-card">
                  <h4>📑 Research Papers</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={inst.yearly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="papers" stroke="#2980b9" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="chart-card">
                  <h4>📊 Current Distribution</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Review Section */}
              <div className="review-section">
                <h4>💬 Public Reviews</h4>
                <ul className="review-list">
                  {inst.reviews.map((review, i) => (
                    <li key={i}>{review}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
