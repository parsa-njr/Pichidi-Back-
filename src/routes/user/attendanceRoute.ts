import { Router } from "express";
import * as attendanceController from "../../controllers/user/attendanceController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
// Routes
router.post(
  "/checkIn",
  requireRole("user"),
  tryCatch(attendanceController.checkIn)
);

router.post(
  "/checkOut",
  requireRole("user"),
  tryCatch(attendanceController.checkOut)
);
router.get(
  "/today-status",
  requireRole("user"),
  tryCatch(attendanceController.getTodayStatus)
);
// ----------------------------
export default router;
