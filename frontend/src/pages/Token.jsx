import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../appwrite/config'
import appLogo from '../assets/Screenshot 2026-04-14 140654.png'

function Token() {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Authenticate using the central authService to verify it matches login password
      const session = await authService.login({ email, password });
      if (session) {
        navigate(activeForm === 'student' ? '/student' : '/admin', { state: { verificationName: name } });
      }
    } catch (err) {
      // Handle the specific Appwrite case where the user is already logged in
      if (err.message && err.message.toLowerCase().includes('session is active')) {
        navigate(activeForm === 'student' ? '/student' : '/admin', { state: { verificationName: name } });
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-16 px-4 min-h-screen relative bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80">
      {/* Universal Out Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 p-2.5 rounded-full transition-all shadow-sm"
        title="Return to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      </button>

      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-lg w-full flex flex-col pt-10 text-center">
        {/* Icon Container */}
        <div className="mx-auto rounded-3xl mb-1 mt-4 w-36 h-36 flex items-center justify-center">
          <img src={appLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
        </div>

        {/* Headings */}
        <h1 className="text-[2.1rem] font-bold text-black tracking-tight leading-none mb-2">
          E-Token
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          College E-Token Management System
        </p>

        {/* Description */}
        <p className="text-gray-500 text-base mb-8 px-10 leading-relaxed">
          Reduce manual work and wait times. Get your digital token for form submissions and document processing.
        </p>

        {/* Buttons / Verification Form */}
        {!activeForm ? (
          <div className="flex flex-col sm:flex-row gap-4 px-8 mb-6">
            <button
              onClick={() => setActiveForm('student')}
              className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-100 text-black font-semibold hover:border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Student
            </button>
            <button
              onClick={() => setActiveForm('admin')}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#111111] text-white font-semibold hover:bg-black transition-colors shadow-sm"
            >
              Admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="px-8 mb-6 flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-black">
                {activeForm === 'student' ? 'Student Verification' : 'Admin Verification'}
              </h3>
              <button type="button" onClick={() => { setActiveForm(null); setError(''); }} className="text-gray-400 text-sm hover:text-black">Cancel</button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Registered Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Login Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Verify your login password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <button disabled={loading} type="submit" className={`w-full mt-2 py-3 rounded-xl text-white font-semibold transition-colors shadow-sm ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#111] hover:bg-black'}`}>
              {loading ? 'Verifying...' : 'Authenticate & Proceed'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 py-5 rounded-b-[1.5rem]">
          <p className="text-[13px] text-gray-500">
            © 2026 College Organization
          </p>
        </div>
      </div>
    </div>
  )
}

export default Token