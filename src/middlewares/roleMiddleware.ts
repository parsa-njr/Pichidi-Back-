import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticationError, ForbiddenError } from "../errors/customErrors";

// const secretKey = process.env.JWT_SECRET_KEY as string;

type UserRole = "user" | "customer";
// Make sure your Express.Request.user is already declared as:
// interface Request { user?: { id: string; role?: UserRole }; }

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;

      const user = {
        id: decoded.id as string,
        role: decoded.role as UserRole,
      };

      if (user.role !== role) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Token invalid" });
    }
  };
};
