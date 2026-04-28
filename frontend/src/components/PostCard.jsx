import React from 'react'
import appwriteService from "../appwrite/config"
import { Link } from 'react-router-dom'


function Postcard({ $id, title, featuredImage }) {
  return (
    <Link to={`/post/${$id}`}>
      <div className='w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow'>
        <div className='w-full justify-center mb-4'>
          <img src={appwriteService.getFilePreview(featuredImage)} alt={title}
            className='rounded-xl w-full' />
        </div>
        <h2
          className='text-xl font-bold text-slate-800'
        >{title}</h2>
      </div>
    </Link>
  )
}

export default Postcard
