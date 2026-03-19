import React, { useState,useContext } from 'react';
import { UserContext } from '../../Context/user.context';
import { BookOpenCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useContext(UserContext);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // console.log(email, password);
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials.');
      }
      console.log('Login successful!', data);
      auth.login(data.user, data.access_token);
      if (data.user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      }else if (data.user.role === 'ADMIN') {
        navigate('/institute-admin');
      }else if (data.user.role === 'FACULTY') {
        navigate('/faculty');
      }else if (data.user.role === 'STUDENT') {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans relative overflow-hidden py-10 px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex flex-col md:flex-row overflow-hidden transform transition-all relative z-10">
        
        {/* Branding Section */}
        <div className="hidden md:flex flex-col justify-center text-center bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-12 w-full md:w-5/12 relative overflow-hidden">
          {/* Abstract glows inside the left panel */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl mix-blend-screen"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-violet-500 rounded-full blur-3xl mix-blend-screen"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <a href="/" className="flex flex-col items-center justify-center gap-4 text-4xl font-bold text-white no-underline mb-8 group">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-xl">
                <BookOpenCheck className="text-indigo-300 w-12 h-12" />
              </div>
              <span className="tracking-tight">Reportify</span>
            </a>
            <p className="text-lg font-light leading-relaxed text-indigo-100 max-w-xs mx-auto">
              Automating Institutional Excellence. Transforming raw data into beautiful, actionable insights.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-10 md:p-14 w-full md:w-7/12 flex flex-col justify-center relative bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mb-8 font-light">
              Log in to access your institution's portal.
            </p>
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email Input Group */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                <label htmlFor="email" className="sr-only">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 pl-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                  required 
                />
              </div>

              {/* Password Input Group */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={20} />
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pl-12 pr-12 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                  required 
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none p-1 border-none bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-end pt-1 transform -translate-y-1">
                <a href="#/" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors">
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-1 h-full bg-rose-500 rounded-full absolute left-0 top-0 bottom-0"></div>
                  <p className="text-sm text-rose-600 font-medium relative">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 mt-2 bg-linear-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg rounded-xl hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Log In'}
              </button>
            </form>
            <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-8">
              <p>
                Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline ml-1">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;