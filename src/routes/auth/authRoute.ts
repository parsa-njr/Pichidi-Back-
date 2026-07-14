import { Router } from "express";
import multer from "multer";
import * as authController from "../../controllers/auth/authController";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/sign-up", authController.signUp);
router.post("/login", authController.login);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authController.getMe); // ← NEW: silent session check

export default router;