import React from 'react'
import {Container, PostForm} from '../components' 

function AddPost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80 w-full py-12"> 
        <Container>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost
