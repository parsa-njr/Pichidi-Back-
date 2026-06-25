import jwt from "jsonwebtoken";

export const createAccessToken = (id: string, role: "user" | "customer") => {
  const secretKey = process.env.JWT_SECRET_KEY as string;
  return jwt.sign({ id, role }, secretKey, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (id: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ id }, refreshSecret, {
    expiresIn: "7d",
  });
};
