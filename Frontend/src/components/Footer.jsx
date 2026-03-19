import React from 'react';
import { BookOpenCheck } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-1 place-self-start">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-6 group">
              <BookOpenCheck className="w-8 h-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
              <span>Reportify</span>
            </a>
            <p className="text-slate-400 font-light leading-relaxed mb-6">Automating Institutional Excellence. Transforming raw data into beautiful, actionable insights.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold mb-2 tracking-wide">Product</h4>
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Integrations</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Demo</a>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold mb-2 tracking-wide">Company</h4>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">About Us</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
          
          <div className="flex flex-col gap-4 max-md:mb-8">
            <h4 className="text-white font-semibold mb-2 tracking-wide">Legal</h4>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center md:flex justify-between items-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} Reportify. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-6 justify-center">
            {/* Social icons placeholder */}
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 hover:text-indigo-400 flex items-center justify-center transition-all cursor-pointer">X</div>
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 hover:text-indigo-400 flex items-center justify-center transition-all cursor-pointer">in</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;