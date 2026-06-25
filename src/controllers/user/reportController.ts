import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Attendance, { IAttendance } from "../../models/attendance";
import Shift, { IShift } from "../../models/shift";
import RequestModel, { IRequest } from "../../models/request";
import User, { IUser } from "../../models/user";
import { tryCatch } from "../../utils/tryCatch";
import {
  generateWorkCalendar,
  calculateDetailedAttendanceReport,
  getPersianDateRange,
  summarizeAttendance,
} from "../../utils/attendanceFunctions";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  query: {
    month?: string;
    year?: string;
  };
}

export const getReport = async (req: AuthenticatedRequest, res: Response) => {
  const { month, year } = req.query;
  const userId = req.user?.id;

  if (!month || !year || !userId) {
    return res.status(400).json({
      success: false,
      message: "Month, year, and user ID are required.",
    });
  }

  const user: IUser | null = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const jYear = parseInt(year, 10);
  const jMonth = parseInt(month, 10);

  let startDate: Date, endDate: Date;
  let daysInMonth: number;
  try {
    ({ startDate, endDate, daysInMonth } = getPersianDateRange(jYear, jMonth));
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid Jalali date",
    });
  }

  // Fetch all data in parallel
  const [attendances, shifts, requests] = await Promise.all([
    Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }) as Promise<IAttendance[]>,
    Shift.findById(user.shift) as Promise<IShift | null>,
    RequestModel.find({
      creator: userId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { date: { $gte: startDate, $lte: endDate } },
      ],
    }).sort({ date: 1 }) as Promise<IRequest[]>,
  ]);

  if (!shifts) {
    return res.status(404).json({
      success: false,
      message: "User's shift not found",
    });
  }
  const requestsForReport = requests.map((r) => ({
    ...r.toObject(), // convert Mongoose document to plain object
    requestType: r.requestType === "overtime" ? "extraTime" : r.requestType,
  }));

  const calendar = generateWorkCalendar(shifts);
  const finalReport = calculateDetailedAttendanceReport(
    calendar,
    attendances,
    requestsForReport,
    shifts
  );
  const totalReport = summarizeAttendance(finalReport);

  return res.status(200).json({
    success: true,
    calendar,
    totalReport,
    finalReport,
    attendances,
    shift: shifts,
    requests,
  });
};
