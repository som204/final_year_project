import React from 'react';
import { ArrowRight } from 'lucide-react';


const CtaSection = () => {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden mt-6">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full mix-blend-color-dodge opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl rounded-full transform scale-y-50"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to Revolutionize Your Reporting?</h2>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Minimize manual effort, enhance accuracy, and gain valuable insights.
          Get started with Reportify today.
        </p>
        <button className="px-10 py-5 rounded-2xl font-bold text-lg bg-linear-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mx-auto group">
          Get a Free Demo <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default CtaSection;