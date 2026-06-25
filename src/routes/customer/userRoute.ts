import { Router } from "express";
import * as userController from "../../controllers/customer/userController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
router.post(
  "/users",
  requireRole("customer"),
  tryCatch(userController.createUser)
);
router.put(
  "/users/:userId",
  requireRole("customer"),
  tryCatch(userController.editUser)
);
router.get(
  "/users",
  requireRole("customer"),
  tryCatch(userController.getUsers)
);
router.delete(
  "/users/:userId",
  requireRole("customer"),
  tryCatch(userController.deleteUser)
);

// ----------------------------
export default router;
