import { Request as ExpressRequest, Response } from "express";
import mongoose, { Types } from "mongoose";
import User, { IUser } from "../../models/user";
import Customer from "../../models/customer";
import RequestModel, { IRequest } from "../../models/request";
import { tryCatch } from "../../utils/tryCatch";
import paginate from "../../utils/paginate";
import { searchFilter } from "../../utils/searchFilter";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import { requestValidation } from "../../validations/requestValidation";

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
  };
  query: {
    search?: string;
  };
  body: {
    requestType: string;
    startDate: string;
    endDate: string;
    userNote?: string;
  };
}

// ──────────────────────────────
// Create a new request
// ──────────────────────────────
export const createRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new NotFoundError("کاربر یافت نشد");
  }

  // Validate input
  const { error } = requestValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { requestType, startDate, endDate, userNote } = req.body;

  const user: IUser | null = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("کاربر یافت نشد");
  }

  // Check for overlapping requests
  const overlap = await RequestModel.findOne({
    user: user._id,
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  });

  if (overlap) {
    throw new ConflictError("درخواست دیگری برای این تاریخ ثبت کرده اید");
  }

  // Create new request
  const newRequest: IRequest = await RequestModel.create({
    user: user._id,
    requestType,
    startDate,
    endDate,
    customer: user.customer,
    userNote: userNote || "",
    status: "pending",
  });

  res.status(201).json({
    success: true,
    newRequest,
  });
};

// ──────────────────────────────
// Get requests for current user
// ──────────────────────────────
export const getRequest = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new NotFoundError("کاربر یافت نشد");
  }

  const { search } = req.query;
  const searchQuery = searchFilter(search, ["status"]);

  const { data, pagination } = await paginate<IRequest>(
    req, // 1️⃣ req
    RequestModel, // 2️⃣ model
    {
      searchFilter: searchQuery,
      sort: { createdAt: -1 },
      populate: [], // or ["field1", "field2"]
      baseFilter: { user: userId },
    } // 3️⃣ options
  );

  res.status(200).json({
    success: true,
    data: pagination
      ? {
          ...pagination,
          data,
        }
      : data,
  });
};
