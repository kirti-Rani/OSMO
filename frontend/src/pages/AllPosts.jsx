import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from '../appwrite/config';

function AllPosts() {
    const [posts, setposts] = useState([])
    useEffect(() => {
        appwriteService.getPosts().then((posts) => {
            if (posts && posts.documents) {
                setposts(posts.documents)
            } else {
                setposts([])
            }
        })
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80 w-full py-12">
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts
