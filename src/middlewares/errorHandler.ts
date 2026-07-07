// // middlewares/errorHandler.ts
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../errors/customErrors";

// const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
//   console.error(error); // لاگ کامل برای debug

//   let statusCode = 500;
//   let message = "Internal server error";

//   if (error instanceof AppError) {
//     statusCode = error.statusCode;
//     message = error.message;
//   } 

//   else if (error instanceof Error) {
//     message = error.message;
//   } 

//   else if (error && typeof error === "object" && "name" in error && "message" in error) {
//     const nameMap: { [key: string]: number } = {
//       ValidationError: 400,
//       NotFoundError: 404,
//       AuthenticationError: 401,
//       ForbiddenError: 403,
//       ConflictError: 409,
//       UnprocessableEntityError: 422,
//     };

//     if (nameMap[(error as any).name]) statusCode = nameMap[(error as any).name];
//     message = (error as any).message;
//   }

//   res.status(statusCode).json({ success: false, message });
// };

// export default errorHandler;
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/customErrors";


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof AppError) {

    return res
      .status(err.statusCode)
      .json({
        success: false,
        error: {
          name: err.name,
          message: err.message,
          statusCode: err.statusCode
        }
      });
  }


  // خطاهای ناشناخته
  return res
    .status(500)
    .json({
      success: false,
      error: {
        name: "InternalServerError",
        message: "Something went wrong",
        statusCode: 500
      }
    });
};