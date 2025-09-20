import React from 'react';
import { DatabaseZap, BarChart3, Users2, FileText, ShieldCheck, Languages } from 'lucide-react';
import '../pages/Home/HomePage.css';

const featuresList = [
  // ... (feature list remains the same as previous response)
  {
    icon: <DatabaseZap size={28} className="feature-icon" />,
    title: 'Data Integration',
    description: 'Effortlessly import data from databases, spreadsheets, and existing institutional systems.',
  },
  {
    icon: <BarChart3 size={28} className="feature-icon" />,
    title: 'Advanced Visualization',
    description: 'Create insightful charts and customizable dashboards to track KPIs and identify trends.',
  },
  {
    icon: <Users2 size={28} className="feature-icon" />,
    title: 'Seamless Collaboration',
    description: 'Work with stakeholders in real-time with collaborative editing, feedback, and version control.',
  },
  {
    icon: <FileText size={28} className="feature-icon" />,
    title: 'Automated Reporting',
    description: 'Generate polished annual reports in multiple formats (PDF, HTML) with customizable templates.',
  },
  {
    icon: <ShieldCheck size={28} className="feature-icon" />,
    title: 'Role-Based Security',
    description: 'Ensure data privacy and integrity with secure authentication and role-based access controls.',
  },
  {
    icon: <Languages size={28} className="feature-icon" />,
    title: 'Multilingual Support',
    description: 'Cater to a diverse community with built-in support for multiple languages.',
  },
];

const Features = () => {
  return (
    <section id="features" className="features-section section-padding">
      <div className="features-header">
        <h2 className="section-title">A Powerful, All-In-One Solution</h2>
        <p className="section-subtitle">
          Everything you need to transform raw data into a compelling story of your institute's success.
        </p>
      </div>
      <div className="features-grid">
        {featuresList.map((feature, index) => (
          <div key={index} className="feature-card">
            {feature.icon}
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;