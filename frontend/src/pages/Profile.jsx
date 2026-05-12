import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from '../components';
import authService from '../appwrite/auth';
import { login } from '../store/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.uploadProfileImage(file);
      // Update redux state with new user data
      dispatch(login({ userData: updatedUser }));
      setSuccess('Profile image updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!userData) {
    return (
      <div className="w-full py-8 text-center min-h-[60vh] flex justify-center items-center">
        <div className="text-xl font-bold text-gray-500">Loading profile...</div>
      </div>
    );
  }

  let profileImageUrl = null;
  if (userData.profileImage) {
      if (userData.profileImage.startsWith('http')) {
          profileImageUrl = userData.profileImage;
      } else {
          profileImageUrl = `/temp/${userData.profileImage}`;
      }
  }

  return (
    <div className="w-full py-12 min-h-[80vh] bg-gray-50 flex justify-center">
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-teal-600 to-cyan-600 relative"></div>
          
          <div className="px-8 pb-10">
            {/* Avatar Section */}
            <div className="relative -mt-16 flex justify-center mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-md">
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt={userData.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name) + '&background=random';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800 text-4xl font-bold">
                      {userData.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 rounded-full hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <span className="text-white text-xs font-semibold">Change</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {/* Status Messages */}
            {error && <div className="mb-4 text-center text-sm text-red-600 bg-red-50 py-2 px-4 rounded-xl">{error}</div>}
            {success && <div className="mb-4 text-center text-sm text-green-600 bg-green-50 py-2 px-4 rounded-xl">{success}</div>}
            {isUploading && <div className="mb-4 text-center text-sm text-blue-600 font-medium">Uploading image...</div>}

            {/* User Details */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{userData.name}</h1>
              <p className="text-gray-500 font-medium">{userData.email}</p>
            </div>
            
            <hr className="my-8 border-gray-100" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account ID</div>
                <div className="font-mono text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 mt-2 truncate">
                  {userData.$id}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
}

export default Profile;
