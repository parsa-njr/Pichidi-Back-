import { Router } from "express";
import locationRoute from "./customer/locationRoute";
import customerProfile from "./customer/ProfileRoute";
import customerReport from "./customer/reportRoute";
import customerRequest from "./customer/requestRoute";
import shiftRoute from "./customer/shiftRoute";
import userRoute from "./customer/userRoute";

import attendanceRoute from "./user/attendanceRoute";
import userRequest from "./user/requestRoute";
import userProfile from "./user/profileRoute";
import userReport from "./user/reportRoute";

import authRoute from "./auth/authRoute";

const router = Router();

// global routes
router.use("/auth", authRoute);

// // user routes
router.use("/user", attendanceRoute, userRequest, userProfile, userReport);

// // customer routes
router.use(
  "/customer",
  locationRoute,
  customerProfile,
  customerReport,
  customerRequest,
  shiftRoute,
  userRoute
);
export default router;
