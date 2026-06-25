import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../../models/user";
import Location, { ILocation } from "../../models/location";
import Shift, { IShift } from "../../models/shift";
import Customer, { ICustomer } from "../../models/customer";
import paginate from "../../utils/paginate";
import { tryCatch } from "../../utils/tryCatch";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import { searchFilter } from "../../utils/searchFilter";
import {
  updateUserValidation,
  userValidation,
} from "../../validations/userValidation";
import { Types } from "mongoose";

// ────────────────────────────────
// 📍 Create a new user
// ────────────────────────────────
export const createUser = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;

  const customer = (await Customer.findById(customerId)) as ICustomer | null;
  if (!customer) throw new NotFoundError("چنین کاربری یافت نشد");

  const { error } = userValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { name, phone, shift, location, password } = req.body;

  const existingUser = (await User.findOne({ phone })) as IUser | null;
  const userLocation = (await Location.findOne({
    _id: location,
    customer: customerId,
  })) as ILocation | null;
  const userShift = (await Shift.findOne({
    _id: shift,
    customer: customerId,
  })) as IShift | null;

  if (existingUser) throw new ConflictError("این شماره قبلاً استفاده شده است");
  if (!userLocation)
    throw new NotFoundError("مکان معتبر یافت نشد یا متعلق به شما نیست");
  if (!userShift)
    throw new NotFoundError("شیفت معتبر یافت نشد یا متعلق به شما نیست");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    phone,
    shift: userShift._id,
    location: userLocation._id,
    password: hashedPassword,
    customer: customerId,
  });

  customer.users.push(newUser._id);
  await customer.save();

  res.status(201).json({
    success: true,
    message: "کاربر با موفقیت ایجاد شد",
  });
};

// ────────────────────────────────
// 📍 Edit an existing user
// ────────────────────────────────
export const editUser = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const userId = req.params.userId as string;

  const { error } = updateUserValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { name, phone, password, location, shift } = req.body;

  const userLocation = (await Location.findOne({
    _id: location,
    customer: customerId,
  })) as ILocation | null;

  const userShift = (await Shift.findOne({
    _id: shift,
    customer: customerId,
  })) as IShift | null;

  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new UnprocessableEntityError("آیدی کاربر معتبر نیست");
  }

  const phoneTaken = (await User.findOne({
    phone,
    _id: { $ne: new Types.ObjectId(userId) }, // ✅ cast to ObjectId
  })) as IUser | null;

  if (phoneTaken) throw new ConflictError("این شماره قبلاً استفاده شده است");
  if (!userLocation)
    throw new NotFoundError("مکان معتبر یافت نشد یا متعلق به شما نیست");
  if (!userShift)
    throw new NotFoundError("شیفت معتبر یافت نشد یا متعلق به شما نیست");

  const updatedFields: Partial<IUser> = {
    name,
    phone,
    location: userLocation._id,
    shift: userShift._id,
  };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedFields.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = (await User.findOneAndUpdate(
    { _id: userId, customer: customerId },
    { $set: updatedFields },
    { new: true, runValidators: true }
  )) as IUser | null;

  if (!updatedUser) throw new NotFoundError("کاربر یافت نشد یا دسترسی ندارید");

  res.status(200).json({
    success: true,
    message: "کاربر با موفقیت به‌روزرسانی شد",
  });
};

// ────────────────────────────────
// 📍 Delete a user
// ────────────────────────────────
export const deleteUser = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const userId = req.params.userId;

  const user = (await User.findOne({
    _id: userId,
    customer: customerId,
  })) as IUser | null;
  if (!user) throw new NotFoundError("کاربر یافت نشد یا دسترسی ندارید");

  await User.findOneAndDelete({ _id: userId });

  await Customer.findByIdAndUpdate(customerId, {
    $pull: { users: userId },
  });

  res.status(200).json({
    success: true,
    message: "کاربر با موفقیت حذف شد",
  });
};

// ────────────────────────────────
// 📍 Get all users with optional search
// ────────────────────────────────
export const getUsers = async (req: Request, res: Response) => {
  const { search } = req.query as { search?: string };
  const customerId = req.user?.id as string;

  const searchQuery = searchFilter(search, ["name", "phone"]);

  const { data, pagination } = await paginate<IUser>(req, User, {
    searchFilter: searchQuery,
    sort: { createdAt: -1 },
    populate: ["location", "shift"],
    baseFilter: { customer: customerId },
  });

  res.status(200).json({
    success: true,
    data: pagination ? { ...pagination, data } : data,
  });
};
