import React from 'react';
import { DatabaseZap, BarChart3, Users2, FileText, ShieldCheck, Languages } from 'lucide-react';


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
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase mb-3">Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">A Powerful, All-In-One Solution</h3>
          <p className="text-lg md:text-xl text-slate-600 font-light">
            Everything you need to transform raw data into a compelling story of your institute's success.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featuresList.map((feature, index) => (
            <div key={index} className="group bg-slate-50 rounded-2xl p-8 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-500 group-hover:h-full transition-all duration-300"></div>
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;