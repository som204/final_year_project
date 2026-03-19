import React from 'react';
import { useLocation } from 'react-router-dom';

const ReportComponent = () => {
    const location = useLocation();
    // Ensure fallback to empty string if data is missing to prevent crash
    const { final_report_data = '' } = location.state || {};

    return (
        <div className="h-screen w-full relative">
            <iframe
                title="Generated Report"
                srcDoc={final_report_data}
                className="block w-full h-full border-none"
                // Optional: sandbox for extra security if you don't trust the HTML entirely
                // sandbox="allow-scripts allow-same-origin" 
            />
        </div>
    );
};

export default ReportComponent;
