import { Router } from "express";
import * as shiftController from "../../controllers/customer/shiftController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
// POST /api/v1/shifts
router.post(
  "/shifts",
  requireRole("customer"),
  tryCatch(shiftController?.createShift)
);

// GET /api/v1/shifts
router.get(
  "/shifts",
  requireRole("customer"),
  tryCatch(shiftController?.getAllShifts)
);

// GET /api/v1/customer/shifts/:shiftId
router.get(
  "/shifts/:shiftId",
  requireRole("customer"),
  tryCatch(shiftController?.getShiftById)
);

// PUT /api/v1/customer/shifts/:shiftId
router.put(
  "/shifts/:shiftId",
  requireRole("customer"),
  tryCatch(shiftController?.updateShift)
);

// DELETE /api/v1/customer/shifts/:shiftId
router.delete(
  "/shifts/:shiftId",
  requireRole("customer"),
  tryCatch(shiftController?.deleteShift)
);

// ----------------------------
export default router;
