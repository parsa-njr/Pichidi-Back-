// import { Request, Response } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import { tryCatch } from "../../utils/tryCatch";
// import {
//   loginValidation,
//   signupValidation,
// } from "../../validations/authValidation";
// import {
//   UnprocessableEntityError,
//   AuthenticationError,
//   NotFoundError,
// } from "../../errors/customErrors";
// import Customer from "../../models/customer";
// import User from "../../models/user";
// import { createAccessToken, createRefreshToken } from "../../utils/authFunctions";

// const createToken = (id: string, role: "user" | "customer") => {
//   const secretKey = process.env.JWT_SECRET_KEY as string;
//   return jwt.sign({ id, role }, secretKey);
// };

// export const signUp = tryCatch(async (req: Request, res: Response) => {
//   const { error } = signupValidation.validate(req.body);
//   if (error)
//     throw new UnprocessableEntityError(
//       error.details.map((d) => d.message).join(", ")
//     );

//   const newCustomer = new Customer(req.body);
//   await newCustomer.save();

//   const accessToken = createAccessToken(
//     newCustomer._id.toString(),
//     "customer"
//   );

//   const refreshToken = createRefreshToken(newCustomer._id.toString());

//   newCustomer.refreshToken = refreshToken;
//   await newCustomer.save();

//   res
//     .cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     })
//     .cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       // path: "/api/auth/refresh",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     })
//     .status(201)
//     .json({
//       message: "ثبت نام موفق",
//       success: true,
//     });
// });

// export const login = tryCatch(async (req: Request, res: Response) => {
//   const { error } = loginValidation.validate(req.body);
//   if (error)
//     throw new UnprocessableEntityError(
//       error.details.map((d) => d.message).join(", ")
//     );

//   const { phone, password } = req.body;

//   let account = await User.findOne({ phone });
//   let role: "user" | "customer" = "user";

//   if (!account) {
//     account = await Customer.findOne({ phone });
//     role = "customer";
//   }

//   if (!account)
//     throw new NotFoundError("حسابی با این شماره وجود ندارد");

//   const match = await bcrypt.compare(password, account.password);
//   if (!match)
//     throw new AuthenticationError("شماره تماس یا رمز اشتباه است");

//   const accessToken = createAccessToken(account._id.toString(), role);
//   const refreshToken = createRefreshToken(account._id.toString());

//   account.refreshToken = refreshToken;
//   await account.save();

//   res
//     .cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     })
//     .cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       // path: "/api/auth/refresh",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     })
//     .status(200)
//     .json({
//       message: "ورود موفق",
//       success: true,
//     });
// });

// export const logout = tryCatch(async (req: Request, res: Response) => {
//   const token = req.cookies.refreshToken;

//   if (token) {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_REFRESH_SECRET as string
//     ) as JwtPayload;

//     const account =
//       (await User.findById(decoded.id)) ||
//       (await Customer.findById(decoded.id));

//     if (account) {
//       account.refreshToken = null;
//       await account.save();
//     }
//   }

//   res
//     .clearCookie("accessToken")
//     .clearCookie("refreshToken")
//     .status(200)
//     .json({ success: true });
// });
// export const refresh = tryCatch(async (req: Request, res: Response) => {
//   const oldRefreshToken = req.cookies.refreshToken;

//   if (!oldRefreshToken)
//     throw new AuthenticationError("No refresh token");

//   let decoded;

//   try {
//     decoded = jwt.verify(
//       oldRefreshToken,
//       process.env.JWT_REFRESH_SECRET as string
//     ) as JwtPayload;
//   } catch {
//     throw new AuthenticationError("Invalid refresh token");
//   }

//   const account =
//     (await User.findById(decoded.id)) ||
//     (await Customer.findById(decoded.id));

//   if (!account || account.refreshToken !== oldRefreshToken) {
//     throw new AuthenticationError("Refresh token mismatch");
//   }

//   const newAccessToken = createAccessToken(
//     account._id.toString(),
//     account.role
//   );

//   const newRefreshToken = createRefreshToken(account._id.toString());

//   account.refreshToken = newRefreshToken;
//   await account.save();

//   res
//     .cookie("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     })
//     .cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       path: "/api/auth/refresh",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     })
//     .status(200)
//     .json({ success: true });
// });


import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { tryCatch } from "../../utils/tryCatch";
import {
  loginValidation,
  signupValidation,
} from "../../validations/authValidation";
import {
  UnprocessableEntityError,
  AuthenticationError,
  NotFoundError,
} from "../../errors/customErrors";
import Customer from "../../models/customer";
import User from "../../models/user";
import {
  createAccessToken,
  createRefreshToken,
} from "../../utils/authFunctions";
import { generateOTP } from "../../utils/otp";


export const signUp = tryCatch(async (req: Request, res: Response) => {
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw new UnprocessableEntityError(
      error.details.map((d) => d.message).join(", ")
    );
  }
  const newCustomer = new Customer(req.body);
  await newCustomer.save();
  const accessToken = createAccessToken(
    newCustomer._id.toString(),
    "customer"
  );
  const refreshToken = createRefreshToken(
    newCustomer._id.toString()
  );
  newCustomer.refreshToken = refreshToken;
  await newCustomer.save();
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({
      success: true,
});
});
// --------------------------------------------------
// LOGIN WITH PASSWORD
// --------------------------------------------------
export const login = tryCatch(async (req: Request, res: Response) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    throw new UnprocessableEntityError(
      error.details.map((d) => d.message).join(", ")
    );
  }
  const { phone, password } = req.body;
  let account = await User.findOne({ phone });
  let role: "user" | "customer" = "user";
  if (!account) {
    account = await Customer.findOne({ phone });
    role = "customer";
  }
  if (!account) {
    throw new NotFoundError(
      "حسابی با این شماره وجود ندارد"
    );
  }
  const match = await bcrypt.compare(
    password,
    account.password
  );
  if (!match) {
    throw new AuthenticationError(
      "شماره تماس یا رمز عبور اشتباه است"
    );
  }
  const accessToken = createAccessToken(
    account._id.toString(),
    role
  );

  const refreshToken = createRefreshToken(
    account._id.toString()
  );
  account.refreshToken = refreshToken;
  await account.save();
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
});
});
// --------------------------------------------------
// SEND OTP
// --------------------------------------------------
export const sendOtp = tryCatch(async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    throw new UnprocessableEntityError("شماره موبایل الزامی است");
  }

  let account = await User.findOne({ phone });
  let role: "user" | "customer" = "user";

  if (!account) {
    account = await Customer.findOne({ phone });
    role = "customer";
  }

  if (!account) {
    throw new NotFoundError("حسابی با این شماره وجود ندارد");
  }

  // ✅ TEST OTP FIXED
  const otp = "1234";

  account.otp = {
    code: otp, // بدون hash برای تست ساده
    expiresIn: new Date(Date.now() + 10 * 60 * 1000), // 10 دقیقه
  };

  await account.save();

  res.status(200).json({
    success: true,
    message: "کد تایید ارسال شد",
    otp, // فقط برای تست
  });
});
// --------------------------------------------------
// VERIFY OTP
// --------------------------------------------------
export const verifyOtp = tryCatch(async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    throw new UnprocessableEntityError(
      "اطالعات ناقص است"
    );
  }
  let account = await User.findOne({ phone });
  let role: "user" | "customer" = "user";

  if (!account) {
    account = await Customer.findOne({ phone });
    role = "customer";
  }
  if (!account) {
    throw new NotFoundError(
      "کاربر پیدا نشد"
    );
  }
  // if (!account.otp?.code) {
  //   throw new AuthenticationError(
  //     "کدی ارسال نشده"
  //   );


  // }

  if (account.otp.code !== code) {
    throw new AuthenticationError("کد تایید اشتباه است");
  }
  if (
    // @ts-ignore
    new Date(account.otp.expiresIn) < new Date()
  ) {
    throw new AuthenticationError(
      "کد منقضی شده"
    );
  }
  // const isValidOtp = await bcrypt.compare(
  //   code,
  //   account.otp.code
  // );
  // if (!isValidOtp) {
  //   throw new AuthenticationError(
  //     "کد تایید اشتباه است"
  //   );
  // }
  const accessToken = createAccessToken(
    account._id.toString(),
    role
  );
  const refreshToken = createRefreshToken(
    account._id.toString()
  );
  account.refreshToken = refreshToken;

  // remove otp after login
  account.otp = undefined;
  await account.save();
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
});
});
// --------------------------------------------------
// LOGOUT
// --------------------------------------------------
export const logout = tryCatch(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;
    const account =
      (await User.findById(decoded.id)) ||
      (await Customer.findById(decoded.id));
    if (account) {
      account.refreshToken = null;
      await account.save();
    }
  }
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({
      success: true,
    });
});
// --------------------------------------------------
// REFRESH TOKEN
// --------------------------------------------------
export const refresh = tryCatch(async (req: Request, res: Response) => {
  const oldRefreshToken =
    req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new AuthenticationError(
      "No refresh token"
    );
  }
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;
  } catch {
    throw new AuthenticationError(
      "Invalid refresh token"
    );
  }
  const account =
    (await User.findById(decoded.id)) ||
    (await Customer.findById(decoded.id));
  if (
    !account ||
    account.refreshToken !== oldRefreshToken
  ) {
    throw new AuthenticationError("Refresh token mismatch"
    );
  }
  const newAccessToken = createAccessToken(
    account._id.toString(),
    account.role
  );
  const newRefreshToken = createRefreshToken(
    account._id.toString()
  );
  account.refreshToken = newRefreshToken;
  await account.save();
  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
    });
});