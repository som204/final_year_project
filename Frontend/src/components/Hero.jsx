import React from 'react';
import { ArrowRight } from 'lucide-react';


const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Decorative background blur */}
      <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-indigo-100 to-transparent opacity-60"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Streamline Your Institute's <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">Annual Report</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
            Aggregate, analyze, and visualize your institute's data effortlessly.
            Turn complex information into insightful, professional reports with our
            automated portal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group text-lg">
              Request a Demo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-300 text-lg">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Mockup Dashboard Image - Placeholder styling */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent z-10 h-32 bottom-0 top-auto"></div>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 sm:p-4 transform hover:-translate-y-2 transition-transform duration-500">
            <div className="rounded-xl overflow-hidden bg-slate-50 aspect-video border border-slate-100 relative">
               <div className="absolute inset-0 bg-linear-to-br from-indigo-50 to-white flex items-center justify-center">
                   <div className="text-center">
                      <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <ArrowRight className="w-10 h-10 text-indigo-600" />
                      </div>
                      <p className="text-slate-500 font-medium tracking-wide">DASHBOARD PREVIEW</p>
                   </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;