import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
  verifyEmail,
  verifyLoginOTP,
  resendLoginOTP,
  resendSignupOTP,
} from "../controllers/user.controller.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/resend-login-otp", resendLoginOTP);
router.post("/resend-signup-otp", resendSignupOTP);
router.get("/logout", logout);

// Profile routes
router.get("/:id/profile", isAuthenticated, getProfile);
router.post("/profile/edit", isAuthenticated, upload.single("file"), editProfile);

// User interaction routes
router.get("/suggested", isAuthenticated, getSuggestedUsers);
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default router;