import { Request, Response } from "express";
import moment from "moment-jalaali";
import Attendance from "../../models/attendance";
import Shift, { IShift } from "../../models/shift";
import RequestModel from "../../models/request";
import User, { IUser } from "../../models/user";
import { tryCatch } from "../../utils/tryCatch";
import paginate from "../../utils/paginate";
import {
  calculateDetailedAttendanceReport,
  generateWorkCalendar,
  summarizeAttendance,
} from "../../utils/attendanceFunctions";

// ----------------------------
// Build attendance report helper
// ----------------------------
function buildAttendanceReport(
  start: moment.Moment,
  end: moment.Moment,
  users: IUser[],
  attendanceMap: Map<string, any>,
  requestsMap: Map<string, any[]>
) {
  const report: any[] = [];

  for (let m = start.clone(); m.isSameOrBefore(end); m.add(1, "day")) {
    const day = m.clone();
    const dateReport: any = { date: day.format("YYYY-MM-DD"), users: [] };

    for (const user of users) {
      // @ts-ignore
      const shift = user.shift as IShift;

      const shiftConfig = {
        startDate: start.toDate(),
        endDate: end.toDate(),
        shiftDays: shift.shiftDays,
        exceptionDays: shift.exceptionDays || [],
      };

      const workCalendar = generateWorkCalendar(shiftConfig);

      const key = `${user._id}_${day.format("YYYY-MM-DD")}`;
      const sessions = attendanceMap.get(key) || [];

      const userRequests = requestsMap.get(user._id.toString()) || [];

      const detailedReport = calculateDetailedAttendanceReport(
        workCalendar,
        [{ date: day.toDate(), sessions }],
        userRequests,
        shiftConfig
      ).find((r: any) => r.date === day.format("YYYY-MM-DD"));

      dateReport.users.push({
        userId: user._id,
        name: user.name,
        shift: detailedReport
          ? {
              isOffDay: detailedReport.isOffDay,
              expectedStart: detailedReport.expectedStart,
              expectedEnd: detailedReport.expectedEnd,
            }
          : null,
        attendance: sessions,
        report: detailedReport,
      });
    }

    report.push(dateReport);
  }

  return report;
}

// ----------------------------
// Get users for a location with pagination
// ----------------------------
export const getUsersBaseLocation = async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { locationId } = req.params;

  const { data, pagination: page } = await paginate(req, User, {
    baseFilter: { customer: customerId, location: locationId },
    sort: { createdAt: -1 },
  });

  res.status(200).json({
    success: true,
    data: page ? { data, ...page } : data,
  });
};

// ----------------------------
// Get attendance report for a single user
// ----------------------------
export const getUserBaseReport = async (req: Request, res: Response) => {
  const { startDate, endDate, userId } = req.query as {
    startDate: string;
    endDate: string;
    userId: string;
  };

  const user = (await User.findById(userId).populate("shift")) as IUser;
  if (!user) return res.status(404).json({ message: "User not found" });

  const [attendances, shift, requests] = await Promise.all([
    Attendance.find({
      user: userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .sort({ date: 1 })
      .lean(),
    Shift.findById(user.shift),
    RequestModel.find({
      creator: userId,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        { date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      ],
    }).lean(),
  ]);

  const requestsForReport = requests.map((r) => ({
    ...r.toObject(), // convert Mongoose document to plain object
    requestType: r.requestType === "overtime" ? "extraTime" : r.requestType,
  }));

  const calendar = generateWorkCalendar(shift as IShift);
  const finalReport = calculateDetailedAttendanceReport(
    calendar,
    attendances,
    requestsForReport,
    shift as IShift
  );
  const totalReport = summarizeAttendance(finalReport);

  res.status(200).json({
    success: true,
    calendar,
    totalReport,
    finalReport,
    attendances,
    shift,
    requests,
  });
};

// ----------------------------
// Get date-based report for multiple users
// ----------------------------
export const getDateBaseLocation = async (req: Request, res: Response) => {
  const { startDate, endDate, userId, location } = req.query as {
    startDate?: string;
    endDate?: string;
    userId?: string;
    location?: string;
  };
  const customerId = req.user!.id;

  if (!startDate || !endDate)
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });

  const userFilter: any = {};
  if (userId) userFilter._id = userId;
  else {
    if (customerId) userFilter.customer = customerId;
    if (location) userFilter.location = location;
  }

  const users = (await User.find(userFilter).populate("shift")) as IUser[];
  if (!users.length)
    return res.status(404).json({ message: "No users found." });

  const start = moment.utc(startDate).startOf("day");
  const end = moment.utc(endDate).endOf("day");

  const attendances = await Attendance.find({
    user: { $in: users.map((u) => u._id) },
    date: { $gte: start.toDate(), $lte: end.toDate() },
  }).lean();

  const attendanceMap = new Map<string, any>();
  for (const att of attendances) {
    const key = `${att.user}_${moment(att.date).format("YYYY-MM-DD")}`;
    attendanceMap.set(key, att.sessions);
  }

  const requests = await RequestModel.find({
    creator: { $in: users.map((u) => u._id) },
    startDate: { $lte: end.toDate() },
    endDate: { $gte: start.toDate() },
  }).lean();

  const requestsMap = new Map<string, any[]>();
  for (const req of requests) {
    // @ts-ignore
    const creator = req.creator!.toString();
    if (!requestsMap.has(creator)) requestsMap.set(creator, []);
    requestsMap.get(creator)!.push(req);
  }

  const report = buildAttendanceReport(
    start,
    end,
    users,
    attendanceMap,
    requestsMap
  );

  res.json(report);
};
