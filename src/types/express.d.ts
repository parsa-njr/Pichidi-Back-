import { ICustomer } from "../src/models/customer"; // adjust the path if needed

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        role?: "user" | "customer";
      };
    }
  }
}
