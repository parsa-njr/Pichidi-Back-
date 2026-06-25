import { Request, Response, NextFunction, RequestHandler } from "express";

// Generic type for async controller functions
type AsyncController = (req: Request, res: Response) => Promise<any>;

/**
 * Wraps an async controller to catch errors and forward them to Express error middleware
 */
export const tryCatch = (controller: AsyncController): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res);
    } catch (error) {
      next(error); // Forward error to Express error-handling middleware
    }
  };
};
