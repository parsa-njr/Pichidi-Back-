import { Router } from "express";
import * as requestController from "../../controllers/customer/requestController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
// Routes
router.get(
  "/requests",
  requireRole("customer"),
  tryCatch(requestController.getRequests)
);
router.post(
  "/requests/:requestId",
  requireRole("customer"),
  tryCatch(requestController.updateRequestStatus)
);

// ----------------------------
export default router;
