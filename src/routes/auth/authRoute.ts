import { Router } from "express";
import multer from "multer";
import * as authController from "../../controllers/auth/authController";
const router = Router();
// ----------------------------
// Configure multer
// ----------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });
// ----------------------------
// Routes
// ----------------------------
router.post("/sign-up", authController.signUp);
router.post("/login", authController.login);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
// ----------------------------
// Export
// ----------------------------
export default router;