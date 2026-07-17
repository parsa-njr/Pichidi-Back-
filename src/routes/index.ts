import { Router } from "express";
import locationRoute from "./customer/locationRoute";
import customerProfile from "./customer/ProfileRoute";
import customerReport from "./customer/reportRoute";
import customerRequest from "./customer/requestRoute";
import shiftRoute from "./customer/shiftRoute";
import userRoute from "./customer/userRoute";
import customerNotification from "./customer/notificationRoute"; // NEW

import attendanceRoute from "./user/attendanceRoute";
import userRequest from "./user/requestRoute";
import userProfile from "./user/profileRoute";
import userReport from "./user/reportRoute";
import userNotification from "./user/notificationRoute";

import authRoute from "./auth/authRoute";

const router = Router();

router.use("/auth", authRoute);

router.use("/user", attendanceRoute, userRequest, userProfile, userReport, userNotification); 

router.use(
  "/customer",
  locationRoute,
  customerProfile,
  customerReport,
  customerRequest,
  shiftRoute,
  userRoute,
  customerNotification 
);
export default router;