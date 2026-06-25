import { Router } from "express";
import * as locationController from "../../controllers/customer/locationController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();


// ----------------------------
// Routes
// POST /api/v1/customer/locations
router.post(
  "/locations",
  requireRole("customer"),
  tryCatch(locationController?.createLocation)
);

// GET /api/v1/customer/locations
router.get(
  "/locations",
  requireRole("customer"),
  tryCatch(locationController?.getAllLocations)
);

// GET /api/v1/customer/locations/:locationId
router.get(
  "/locations/:locationId",
  requireRole("customer"),
  tryCatch(locationController?.getLocationById)
);

// PUT /api/v1/customer/locations/:locationId
router.put(
  "/locations/:locationId",
  requireRole("customer"),
  tryCatch(locationController?.updateLocation)
);

// DELETE /api/v1/customer/locations/:locationId
router.delete(
  "/locations/:locationId",
  requireRole("customer"),
  tryCatch(locationController?.deleteLocation)
);

// ----------------------------
export default router;
