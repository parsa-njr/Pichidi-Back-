import { Request, Response } from "express";
import { Types } from "mongoose";
import RequestModel, { IRequest } from "../../models/request";
import User from "../../models/user";
import Customer from "../../models/customer";
import { tryCatch } from "../../utils/tryCatch";
// import { searchFilter } from "../../utils/search filter";
import paginate from "../../utils/paginate";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import { searchFilter } from "../../utils/searchFilter";
import { updateRequestStatusValidation } from "../../validations/requestValidation";
import Notification from "../../models/notification"; // NEW import at top


// GET requests
export const getRequests = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const { search } = req.query;
  const searchQuery = searchFilter(search as string, ["status"]);

  // Call paginate utility
  const { data, pagination } = await paginate<IRequest>(req, RequestModel, {
    searchFilter: searchQuery,
    sort: { createdAt: -1 },
    populate: ["user"],
    baseFilter: { customer: customerId },
  });

  res.status(200).json({
    success: true,
    data: pagination
      ? {
          data,
          ...pagination,
        }
      : data,
  });
};

// UPDATE request status
export const updateRequestStatus = async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const requestId = req.params.requestId;

  const { status, customerNote } = req.body as {
    status: "accepted" | "pending" | "rejected";
    customerNote?: string;
  };

  // Validate request body
  const { error } = updateRequestStatusValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(", ");
    throw new UnprocessableEntityError(errorMessage);
  }

  // Check if the request exists
  const existingRequest = await RequestModel.findOne({
    _id: requestId,
    customer: customerId,
  }).exec();

  if (!existingRequest) {
    throw new NotFoundError("درخواست یافت نشد.");
  }

  // Prevent updating if status is finalized
  if (existingRequest.status !== "pending") {
    throw new ConflictError(
      "وضعیت این درخواست قبلاً نهایی شده و قابل تغییر نیست."
    );
  }

  // Update the request
  // Update the request
  const updatedRequest: IRequest | null = await RequestModel.findByIdAndUpdate(
    requestId,
    { status, customerNote, reviewedAt: new Date() },
    { new: true, runValidators: true }
  ).exec();

  // NEW: notify the user
  await Notification.create({
    recipient: existingRequest.user,
    recipientRole: "user",
    type: status === "accepted" ? "request_accepted" : "request_rejected",
    title:
      status === "accepted" ? "درخواست شما پذیرفته شد" : "درخواست شما رد شد",
    message:
      customerNote ||
      (status === "accepted"
        ? "درخواست شما با موفقیت پذیرفته شد"
        : "درخواست شما رد شد"),
    request: existingRequest._id,
  });

  res.status(200).json({
    success: true,
    message: "تغییر وضعیت با موفقیت انجام شد",
    updatedRequest,
  });
};
