import { Request, Response } from "express";
import Customer from "../../models/customer";
import Shift, { IShift } from "../../models/shift";
import { tryCatch } from "../../utils/tryCatch";
import paginate from "../../utils/paginate";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import { shiftValidation } from "../../validations/shiftValidation";
import { searchFilter } from "../../utils/searchFilter";

// ───────────────────────────────────────────
// 📍 Create a new shift
// ───────────────────────────────────────────
export const createShift = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;

  const customer = await Customer.findById(customerId);
  if (!customer) throw new NotFoundError("چنین مشتری‌ای یافت نشد");

  const { error } = shiftValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const {
    shiftName,
    startDate,
    endDate,
    formalHolidays,
    shiftDays,
    exceptionDays,
  } = req.body;

  await Shift.create({
    customer: customerId,
    shiftName,
    startDate,
    endDate,
    formalHolidays,
    shiftDays,
    exceptionDays,
  });

  res.status(201).json({
    success: true,
    message: "شیفت با موفقیت ایجاد شد",
  });
};

// ───────────────────────────────────────────
// 📍 Get all shifts for current customer
// ───────────────────────────────────────────
export const getAllShifts = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const { search } = req.query;

  const searchQuery = searchFilter(search as string, ["shiftName"]);

  const { data, pagination } = await paginate<IShift>(req, Shift, {
    searchFilter: searchQuery,
    baseFilter: { customer: customerId },
  });

  res.status(200).json({
    success: true,
    data: pagination ? { ...pagination, data } : data,
  });
};

// ───────────────────────────────────────────
// 📍 Get a single shift
// ───────────────────────────────────────────
export const getShiftById = async (req: Request, res: Response) => {
  const shiftId = req.params.shiftId;

  const shift = await Shift.findById(shiftId);
  if (!shift) throw new NotFoundError("شیفت یافت نشد");

  res.status(200).json({
    success: true,
    data: shift,
  });
};

// ───────────────────────────────────────────
// 📍 Update a shift
// ───────────────────────────────────────────
export const updateShift = async (req: Request, res: Response) => {
  const shiftId = req.params.shiftId;
  const customerId = req.user?.id as string;

  const customer = await Customer.findById(customerId);
  if (!customer) throw new NotFoundError("چنین مشتری‌ای یافت نشد");

  const { error } = shiftValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const updatedShift = await Shift.findOneAndUpdate(
    { _id: shiftId, customer: customerId },
    {
      $set: {
        shiftName: req.body.shiftName,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        formalHolidays: req.body.formalHolidays,
        shiftDays: req.body.shiftDays,
        exceptionDays: req.body.exceptionDays,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedShift) throw new NotFoundError("شیفت یافت نشد");

  res.status(200).json({
    success: true,
    message: "شیفت با موفقیت به‌روزرسانی شد",
  });
};

// ───────────────────────────────────────────
// 📍 Delete a shift
// ───────────────────────────────────────────
export const deleteShift = async (req: Request, res: Response) => {
  const shiftId = req.params.shiftId;

  const deleted = await Shift.findByIdAndDelete(shiftId);
  if (!deleted) throw new NotFoundError("شیفت یافت نشد");

  res.status(200).json({
    success: true,
    message: "شیفت با موفقیت حذف شد",
  });
};
