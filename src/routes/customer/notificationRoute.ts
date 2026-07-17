import { Router } from "express";
import * as notificationController from "../../controllers/notificationController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

router.get(
    "/notifications",
    requireRole("customer"),
    tryCatch(notificationController.getNotifications)
);
router.post(
    "/notifications/:notificationId/read",
    requireRole("customer"),
    tryCatch(notificationController.markNotificationRead)
);
router.post(
    "/notifications/read-all",
    requireRole("customer"),
    tryCatch(notificationController.markAllNotificationsRead)
);

export default router;