// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/customErrors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // <-- add this, you're currently flying blind

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      name: "InternalServerError",
      message: "Something went wrong",
      statusCode: 500,
    },
  });
};