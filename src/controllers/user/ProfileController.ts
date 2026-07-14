import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../../models/user";
import Customer from "../../models/customer";
import { tryCatch } from "../../utils/tryCatch";
import profileValidation from "../../validations/profileValidation";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
  file?: Express.Multer.File;
}

export const editProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { error } = profileValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { name, phone, password } = req.body;
  const updatedFields: Partial<IUser> = { name, phone };

  // Check if the phone exists in customers
  const existingCustomer = await Customer.findOne({ phone });
  if (existingCustomer) {
    throw new ConflictError(
      "این شماره قبلاً توسط یک کاربر دیگر استفاده شده است"
    );
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedFields.password = await bcrypt.hash(password, salt);
  }

  if (req.file) {
    updatedFields.profileImage = `/uploads/profile-images/${req.file.filename}`;
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "پروفایل با موفقیت ویرایش شد",
      user: {
        id: updatedUser?._id,
        name: updatedUser?.name,
        phone: updatedUser?.phone,
        profileImage: updatedUser?.profileImage,
      },
    });
  } catch (err: any) {
    if (
      err.name === "MongoServerError" &&
      err.code === 11000 &&
      err.keyPattern?.phone
    ) {
      throw new ConflictError(
        "این شماره قبلاً توسط یک کاربر دیگر استفاده شده است"
      );
    }
    throw err;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new NotFoundError("چنین کاربری یافت نشد");
  }

  res.status(200).json({
    user,
    success: true,
  });
};
