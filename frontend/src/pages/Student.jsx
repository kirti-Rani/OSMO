import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { localTokenService } from '../services/localTokenService';
import authService from '../appwrite/auth';
import appLogo from '../assets/Screenshot 2026-04-14 142037.png';

function Student() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tokens, setTokens] = useState([]);
  const [serviceType, setServiceType] = useState('form_submission');
  const [userName, setUserName] = useState("Rahul Sharma");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) {
        setUserName(user.name || user.email.split('@')[0] || "Student");
        if (user.profileImage) {
          setProfilePhoto(`/temp/${user.profileImage}`);
        }
      }
    });

    return localTokenService.subscribeToTokens(setTokens);
  }, []);

  // Filter tokens to show only the current student's tokens and sort them serial wise (ascending)
  const studentTokens = tokens
    .filter(t => t.studentName === userName)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const handleRequestToken = async () => {
    if (!serviceType || isSubmitting) return;
    setIsSubmitting(true);

    // Fake a brief network delay
    setTimeout(async () => {
      await localTokenService.requestToken('student-' + userName.replace(/\s+/g, '').toLowerCase(), userName, serviceType);
      setIsSubmitting(false);
    }, 600);
  };

  const handleCancelToken = (id) => {
    localTokenService.updateTokenStatus(id, 'cancelled');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80 font-sans w-full">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 px-6 py-3 flex justify-between items-center shadow-lg relative z-10 w-full">
        <div className="flex items-center gap-2">
          <div className="text-black w-8 h-8 flex items-center justify-center">
            <img src={appLogo} alt="Logo" className="w-[120%] h-[120%] min-w-[32px] object-contain" />
          </div>
          <span className="font-bold text-xl text-black tracking-tight ml-1">E-Token</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-sm font-semibold text-gray-800 leading-tight text-right w-36 px-1 truncate">
              {userName}
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 rounded-full mt-0.5 tracking-wide shadow-sm">STUDENT</span>
          </div>

          {/* Profile Photo Upload */}
          <label className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden border border-yellow-200 cursor-pointer relative group" title="Upload Profile Photo">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl pt-1">👱</span>
            )}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          <button
            onClick={() => navigate('/token')}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            title="Go to Token Landing Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left panel: Request form */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">Request New Token</h2>
            <p className="text-gray-500 text-sm mb-7">Select the service you need help with</p>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">Service Type</label>
              <div className="relative inline-block w-full max-w-[240px]">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-400 bg-white appearance-none cursor-pointer pr-10"
                >
                  <option value="form_submission">form_submission</option>
                  <option value="fee_payment">fee_payment</option>
                  <option value="document_verification">document_verification</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleRequestToken}
              className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-400 hover:to-cyan-500 shadow-xl shadow-teal-500/30`}
            >
              {isSubmitting ? 'Requesting...' : 'Request Token'}
            </button>
          </div>

          {/* Right panel: Token History */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">My Token History</h2>
            <p className="text-gray-500 text-sm mb-7">Track your current and past tokens</p>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 rounded-xl">
              {studentTokens.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl w-full">
                  <p className="text-gray-400 font-medium text-sm">No tokens requested yet.</p>
                </div>
              ) : (
                studentTokens.map((token, index) => (
                  <div key={index} className={`border rounded-2xl p-5 shadow-sm relative transition-all duration-300 hover:shadow-md ${token.status === 'pending' ? 'border-teal-200 bg-teal-50/60' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <span className="text-[20px] font-bold text-black">#{token.tokenNumber}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm inline-flex items-center
                           ${token.status === 'pending' ? 'border-gray-200 text-[#111] bg-white' :
                          token.status === 'cancelled' ? 'border-red-100 text-red-600 bg-red-50' :
                            'border-green-100 text-green-600 bg-green-50'}`
                      }>
                        {token.status === 'pending' && <span className="w-[5px] h-[5px] rounded-full bg-gray-500 animate-pulse mr-2"></span>}
                        {token.status}
                      </span>
                      <span className="ml-auto text-[12px] text-gray-400 font-medium">{token.date}</span>
                    </div>
                    <h3 className="text-gray-600 text-[14px] mb-2 font-semibold">{token.serviceType || token.service}</h3>
                    {token.status === 'pending' && (
                      <div className="text-gray-400 text-[13px] flex items-center gap-1.5 font-medium mt-3 border-t border-gray-100 pt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        Est. Wait: {token.wait}
                      </div>
                    )}
                    
                    {token.status === 'calling' && token.callTime && (
                      <div className="text-blue-600 text-[13px] flex items-center gap-1.5 font-medium mt-3 border-t border-blue-100 pt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        Please arrive by: <span className="font-bold">{token.callTime}</span>
                      </div>
                    )}

                    {token.status === 'pending' && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <button
                          onClick={() => handleCancelToken(token.id)}
                          className="text-[13px] font-semibold text-red-600 hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Student;
