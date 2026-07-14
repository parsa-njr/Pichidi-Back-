import { Request, Response } from "express";
import { Types } from "mongoose";
import Attendance, { IAttendance } from "../../models/attendance";
import Location, { ILocation } from "../../models/location";
import User, { IUser } from "../../models/user";
import { tryCatch } from "../../utils/tryCatch";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import getDistanceMeters from "../../utils/getDistanceMeters";

// Extend Express Request to include user
interface AuthRequest extends Request {
  user: { id: string };
}

interface CheckBody {
  lat: number;
  lng: number;
}

export const checkIn = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { lat, lng } = req.body as CheckBody;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const user = (await User.findById(userId).populate("location")) as
    | (IUser & { location: ILocation })
    | null;
  const location = user?.location;

  if (!location) {
    throw new NotFoundError("محل کار یافت نشد");
  }

  const distance = getDistanceMeters(
    lat,
    lng,
    location.latitude,
    location.longitude
  );

  if (distance > location.range) {
    throw new UnprocessableEntityError("شما در محل نیستید");
  }

  let attendance = (await Attendance.findOne({
    user: userId,
    date: todayStr,
  })) as IAttendance | null;

  if (!attendance) {
    attendance = new Attendance({
      user: new Types.ObjectId(userId),
      date: todayStr,
      sessions: [],
    });
  }

  const lastSession = attendance.sessions[attendance.sessions.length - 1];
  if (lastSession && !lastSession.checkOut) {
    throw new UnprocessableEntityError("ورود شما از قبل ثبت شده است");
  }

  attendance.sessions.push({ checkIn: today });
  await attendance.save();

  res
    .status(201)
    .json({ success: true, message: "ورود با موفقیت ثبت شد", attendance });
};

export const checkOut = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { lat, lng } = req.body as CheckBody;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const user = (await User.findById(userId).populate("location")) as
    | (IUser & { location: ILocation })
    | null;
  const location = user?.location;

  if (!location) {
    throw new NotFoundError("محل کار یافت نشد");
  }

  const distance = getDistanceMeters(
    lat,
    lng,
    location.latitude,
    location.longitude
  );

  if (distance > location.range) {
    throw new UnprocessableEntityError("شما در محل نیستید");
  }

  const attendance = (await Attendance.findOne({
    user: userId,
    date: todayStr,
  })) as IAttendance | null;

  if (!attendance || attendance.sessions.length === 0) {
    throw new UnprocessableEntityError("ابتدا ورود خود را ثبت کنید");
  }

  const lastSession = attendance.sessions[attendance.sessions.length - 1];

  if (lastSession.checkOut) {
    throw new UnprocessableEntityError("خروج شما از قبل ثبت شده است");
  }

  lastSession.checkOut = today;
  await attendance.save();

  res
    .status(201)
    .json({ success: true, message: "خروج با موفقیت ثبت شد", attendance });
};

export const getTodayStatus = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().slice(0, 10);

  const attendance = (await Attendance.findOne({
    user: userId,
    date: todayStr,
  })) as IAttendance | null;

  const lastSession = attendance?.sessions[attendance.sessions.length - 1];
  const isCheckedIn = !!(lastSession && !lastSession.checkOut);

  res.status(200).json({
    success: true,
    isCheckedIn,
    checkInTime: isCheckedIn ? lastSession?.checkIn : null,
  });
};