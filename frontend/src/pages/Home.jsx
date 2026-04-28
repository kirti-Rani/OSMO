import React, { useEffect, useState } from 'react'
import appwriteService from '../appwrite/config';
import { Container, PostCard } from '../components'

function Home() {
    const [posts, setPosts] = useState([])
    useEffect(() => {
        appwriteService.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])

    if (posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80 w-full py-8 text-center flex items-center justify-center">
                <Container>
                    <div className='flex flex-wrap shadow-lg p-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20'>
                        <div className='p-2 w-full'>
                            <h1 className="text-3xl font-extrabold text-white tracking-wide hover:text-teal-200 transition-colors drop-shadow-md">
                                Login to get token and read posts of organisation ✨
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
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

export default Home
