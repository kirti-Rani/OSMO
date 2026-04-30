import { Router } from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateProfileImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/profile-image").post(verifyJWT, upload.single("image"), updateProfileImage);

export default router;
