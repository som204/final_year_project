// src/components/Contact.jsx
import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase mb-3">Contact Us</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">Get in Touch</h3>
          <p className="text-lg text-slate-600 font-light">
            Have questions about Reportify or want to schedule a personalized demo? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
          {/* Contact Information */}
          <div className="space-y-12 pr-0 lg:pr-8">
            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:-translate-y-1 transition-all duration-300">
                  <Mail className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Email</h4>
                  <p className="text-slate-600 leading-relaxed mb-1">Our friendly team is here to help.</p>
                  <a href="mailto:hello@reportify.edu" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">hello@reportify.edu</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:-translate-y-1 transition-all duration-300">
                  <MapPin className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Office</h4>
                  <p className="text-slate-600 leading-relaxed mb-1">Come say hello at our headquarters.</p>
                  <p className="text-indigo-600 font-medium tracking-wide">123 Innovation Drive<br/>Tech Campus, TC 90210</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:-translate-y-1 transition-all duration-300">
                  <Phone className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Phone</h4>
                  <p className="text-slate-600 leading-relaxed mb-1">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15550000000" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">+1 (555) 000-0000</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea rows="4" placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"></textarea>
              </div>
              <button type="button" className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
