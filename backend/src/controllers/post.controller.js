import { Post } from "../models/post.model.js";
import fs from "fs";
import path from "path";

// Create Post
export const createPost = async (req, res) => {
    try {
        const { title, slug, content, featuredImage, status } = req.body;
        
        if (!title || !slug || !content || !featuredImage) {
            return res.status(400).json({ message: "Fields are required" });
        }
        
        const userId = req.user._id;

        const post = await Post.create({
            title,
            slug,
            content,
            featuredImage,
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
        const { title, content, featuredImage, status } = req.body;
        
        const post = await Post.findOneAndUpdate(
            { slug },
            {
                $set: {
                    title,
                    content,
                    featuredImage,
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
        const post = await Post.findOne({ slug });
        
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
        const posts = await Post.find({ status: "active" });
        
        const mappedPosts = posts.map(p => ({ ...p._doc, $id: p.slug }));

        return res.status(200).json({
            documents: mappedPosts,
            total: mappedPosts.length
        });
    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
};

// Upload File
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        // Simulating Appwrite's $id with the filename
        return res.status(200).json({ $id: req.file.filename });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete File (Local implementation)
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const filePath = path.resolve(`./public/temp/${fileId}`);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({ message: "File deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
