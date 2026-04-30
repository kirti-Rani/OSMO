import { Router } from "express";
import { createPost, updatePost, deletePost, getPost, getPosts, uploadFile, deleteFile, toggleLike, addComment } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getPosts);
router.route("/:slug").get(getPost);

// Secured modifying routes
router.route("/").post(verifyJWT, createPost);
router.route("/:slug").patch(verifyJWT, updatePost).delete(verifyJWT, deletePost);
router.route("/:slug/like").post(verifyJWT, toggleLike);
router.route("/:slug/comment").post(verifyJWT, addComment);

// File handling
router.route("/upload").post(verifyJWT, upload.array("images", 5), uploadFile);
router.route("/file/:fileId").delete(verifyJWT, deleteFile);

export default router;
