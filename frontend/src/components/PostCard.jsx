import React, { useState } from 'react'
import appwriteService from "../appwrite/config"
import { Link } from 'react-router-dom'


function Postcard({ $id, title, featuredImage, images, userId, likes, comments }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardImages = images?.length > 0 ? images : (featuredImage ? [featuredImage] : []);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % cardImages.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + cardImages.length) % cardImages.length);
  };

  return (
    <Link to={`/post/${$id}`} className="block">
      <div className='w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow'>
        {userId && userId.name && (
          <div className="mb-3 text-sm font-semibold text-slate-600 flex items-center gap-2 border-b pb-2">
            👤 {userId.name}
          </div>
        )}
        <div className='w-full justify-center mb-4 relative overflow-hidden rounded-xl bg-black/5'>
          {cardImages.length > 0 && (
            <img src={appwriteService.getFilePreview(cardImages[currentImageIndex])} alt={title}
              className='w-full h-48 object-cover' />
          )}
          
          {cardImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-md text-slate-800 transition z-10"
              >
                &larr;
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-md text-slate-800 transition z-10"
              >
                &rarr;
              </button>
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm z-10 pointer-events-none">
                  {currentImageIndex + 1} / {cardImages.length}
              </div>
            </>
          )}
        </div>
        <h2
          className='text-xl font-bold text-slate-800 mb-4 truncate'
        >{title}</h2>
        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium border-t pt-2">
            <div className="flex items-center gap-1">
                <span>❤️</span> {likes?.length || 0}
            </div>
            <div className="flex items-center gap-1">
                <span>💬</span> {comments?.length || 0}
            </div>
        </div>
      </div>
    </Link>
  )
}

export default Postcard
