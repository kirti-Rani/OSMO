import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [isLiking, setIsLiking] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? (post.userId?._id || post.userId) === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    const handleLike = async () => {
        if (!userData || isLiking) return;
        setIsLiking(true);
        const updatedPost = await appwriteService.toggleLike(post.$id);
        if (updatedPost) setPost(updatedPost);
        setIsLiking(false);
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!userData || !commentText.trim() || isCommenting) return;
        setIsCommenting(true);
        const updatedPost = await appwriteService.addComment(post.$id, commentText);
        if (updatedPost) {
            setPost(updatedPost);
            setCommentText("");
        }
        setIsCommenting(false);
    };

    const hasLiked = post?.likes?.includes(userData?.$id);

    const images = post?.images?.length > 0 ? post.images : (post?.featuredImage ? [post.featuredImage] : []);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="mb-6 flex justify-start">
                    <Link to="/">
                        <Button bgColor="bg-white/80" textColor="text-teal-900" className="shadow-sm border border-slate-200 hover:bg-white flex items-center gap-2 font-semibold">
                            <span>&larr;</span> Back to Posts
                        </Button>
                    </Link>
                </div>
                <div className="w-full flex flex-col items-center mb-4 relative border rounded-xl p-4 bg-white/50 backdrop-blur-sm">
                    {post.userId && post.userId.name && (
                        <div className="w-full mb-3 text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">
                            👤 {post.userId.name}
                        </div>
                    )}
                    
                    <div className="relative w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center min-h-[300px]">
                        {images.length > 0 && (
                            <img
                                src={appwriteService.getFilePreview(images[currentImageIndex])}
                                alt={`${post.title} - image ${currentImageIndex + 1}`}
                                className="w-full object-contain max-h-[60vh] transition-all duration-300"
                            />
                        )}
                        
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-slate-800 transition"
                                >
                                    &larr;
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-slate-800 transition"
                                >
                                    &rarr;
                                </button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="w-full mt-4 flex gap-2 overflow-x-auto pb-2 justify-center">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                                        currentImageIndex === idx ? "border-indigo-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img
                                        src={appwriteService.getFilePreview(img)}
                                        alt={`thumbnail ${idx + 1}`}
                                        className="h-16 w-24 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {isAuthor && (
                        <div className="absolute right-6 top-6">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="w-full mb-6">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>
                <div className="browser-css">
                    {parse(post.content)}
                </div>

                <div className="mt-8 border-t pt-6 border-slate-200">
                    <div className="flex items-center gap-4 mb-6">
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
                                hasLiked ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <span className="text-xl">{hasLiked ? "❤️" : "🤍"}</span>
                            {post.likes?.length || 0} Likes
                        </button>
                    </div>

                    <div className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
                        <h3 className="text-xl font-bold mb-4">Comments ({post.comments?.length || 0})</h3>
                        
                        <form onSubmit={handleComment} className="mb-6">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                rows="3"
                            ></textarea>
                            <Button type="submit" bgColor="bg-teal-600" className="mt-2" disabled={isCommenting}>
                                {isCommenting ? "Posting..." : "Post Comment"}
                            </Button>
                        </form>

                        <div className="flex flex-col gap-4">
                            {post.comments?.map((comment, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                    <div className="font-semibold text-slate-800 mb-1 text-sm flex items-center justify-between">
                                        <span>👤 {comment.user?.name || "Unknown User"}</span>
                                        <span className="text-slate-400 font-normal text-xs">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-700">{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link to="/">
                        <Button bgColor="bg-slate-200" textColor="text-slate-700" className="shadow-sm hover:bg-slate-300 flex items-center gap-2 font-semibold px-6 py-3 rounded-full">
                            <span>&larr;</span> Return to All Posts
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    ) : null;
}
