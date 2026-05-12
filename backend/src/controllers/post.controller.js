import { Post } from "../models/post.model.js";
import fs from "fs";
import path from "path";

// Create Post
export const createPost = async (req, res) => {
    try {
        const { title, slug, content, featuredImage, images, status } = req.body;
        
        if (!title || !slug || !content) {
            return res.status(400).json({ message: "Fields are required" });
        }
        
        const userId = req.user._id;

        const post = await Post.create({
            title,
            slug,
            content,
            featuredImage,
            images: images || [],
            status,
            userId
        });

        // Add $id for Appwrite compatibility
        const responseData = { ...post._doc, $id: post.slug };

        return res.status(201).json(responseData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Update Post
export const updatePost = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content, featuredImage, images, status } = req.body;
        
        const post = await Post.findOneAndUpdate(
            { slug },
            {
                $set: {
                    title,
                    content,
                    featuredImage,
                    images: images || [],
                    status
                }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const responseData = { ...post._doc, $id: post.slug };
        return res.status(200).json(responseData);
    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
};

// Delete Post
export const deletePost = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOneAndDelete({ slug });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get Post
export const getPost = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({ slug })
            .populate("userId", "name")
            .populate("comments.user", "name");
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const responseData = { ...post._doc, $id: post.slug };
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get Posts
export const getPosts = async (req, res) => {
    try {
        // Simple implementation assuming status=active query.
        // Can be expanded to parse full Appwrite query strings if needed.
        const posts = await Post.find({ status: "active" })
            .populate("userId", "name")
            .populate("comments.user", "name");
        
        const mappedPosts = posts.map(p => ({ ...p._doc, $id: p.slug }));

        return res.status(200).json({
            documents: mappedPosts,
            total: mappedPosts.length
        });
    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
};

import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Upload File
export const uploadFile = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            if (req.file) {
                const uploadResult = await uploadOnCloudinary(req.file.path);
                if (!uploadResult) {
                    return res.status(500).json({ message: "Error uploading file to Cloudinary" });
                }
                // Return secure_url instead of filename
                return res.status(200).json({ $id: uploadResult.secure_url, fileIds: [uploadResult.secure_url] });
            }
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const uploadPromises = req.files.map(f => uploadOnCloudinary(f.path));
        const uploadResults = await Promise.all(uploadPromises);
        
        const fileUrls = uploadResults.filter(r => r !== null).map(r => r.secure_url);
        
        if (fileUrls.length === 0) {
             return res.status(500).json({ message: "Error uploading files to Cloudinary" });
        }
        
        // Return both $id (for backward compatibility) and fileIds
        return res.status(200).json({ $id: fileUrls[0], fileIds: fileUrls });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete File (Local implementation -> Cloudinary)
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Note: With Cloudinary, fileId is a full URL.
        // We need to extract the publicId from the URL to delete it.
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1612345678/sample.jpg
        // Public ID is usually 'sample'
        
        let publicId = fileId;
        if (fileId.includes('res.cloudinary.com')) {
            const parts = fileId.split('/');
            const filenameWithExt = parts[parts.length - 1];
            publicId = filenameWithExt.split('.')[0];
        } else {
            // It might be a local file ID from old data. Fallback to fs.unlink
            const filePath = path.resolve(`./public/temp/${fileId}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(200).json({ message: "Local file deleted" });
        }
        
        await deleteFromCloudinary(publicId);

        return res.status(200).json({ message: "File deleted from Cloudinary" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Toggle Like
export const toggleLike = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOne({ slug });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const userId = req.user._id;
        const hasLiked = post.likes.includes(userId);
        
        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }
        
        await post.save();
        
        // Re-fetch to populate
        const updatedPost = await Post.findOne({ slug })
            .populate("userId", "name")
            .populate("comments.user", "name");
            
        const responseData = { ...updatedPost._doc, $id: updatedPost.slug };
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { slug } = req.params;
        const { text } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findOne({ slug });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const userId = req.user._id;
        
        post.comments.push({
            user: userId,
            text
        });
        
        await post.save();
        
        // Re-fetch to populate
        const updatedPost = await Post.findOne({ slug })
            .populate("userId", "name")
            .populate("comments.user", "name");
            
        const responseData = { ...updatedPost._doc, $id: updatedPost.slug };
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
