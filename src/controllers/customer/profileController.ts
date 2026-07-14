import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Customer, { ICustomer } from "../../models/customer";
import User, { IUser } from "../../models/user";
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import { tryCatch } from "../../utils/tryCatch";
import profileValidation from "../../validations/profileValidation";

// ----------------------------
// Edit Profile
// ----------------------------
export const editProfile = async (req: Request, res: Response) => {
  const customerId = req.user!.id; // using ! because we are sure JWT middleware populated user

  // Validate input
  const { error } = profileValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(", ");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { name, phone, password } = req.body;

  // Check phone uniqueness
  const existingCustomer: ICustomer | IUser | null = await User.findOne({
    phone,
  });
  if (existingCustomer) {
    throw new ConflictError(
      "این شماره قبلاً توسط یک کاربر دیگر استفاده شده است"
    );
  }

  const updatedFields: Partial<ICustomer> = { name, phone };

  // Hash new password if provided
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedFields.password = await bcrypt.hash(password, salt);
  }

  // Update profile image if file uploaded
  if (req.file) {
    updatedFields.profileImage = `/uploads/profile-images/${req.file.filename}`;
  }

  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: customerId },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      throw new NotFoundError("چنین کاربری یافت نشد");
    }

    // res.status(200).json({
    //   success: true,
    //   message: "پروفایل با موفقیت ویرایش شد",
    //   customer: updatedCustomer,
    // });

      // const updatedUser = await User.findOneAndUpdate(
      //     { _id: userId },
      //     { $set: updatedFields },
      //     { new: true, runValidators: true }
      //   );
    
        res.status(200).json({
          success: true,
          message: "پروفایل با موفقیت ویرایش شد",
          user: {
            id: updatedCustomer?._id,
            name: updatedCustomer?.name,
            phone: updatedCustomer?.phone,
            profileImage: updatedCustomer?.profileImage,
          },
        });
  } catch (err: any) {
    // Handle duplicate key error (phone)
    if (err.code === 11000 && err.keyPattern?.phone) {
      throw new ConflictError(
        "این شماره قبلاً توسط یک کاربر دیگر استفاده شده است"
      );
    }
    throw err;
  }
};

// ----------------------------
// Get Profile
// ----------------------------
export const getProfile = async (req: Request, res: Response) => {
  const customerId = req.user!.id;

  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new NotFoundError("چنین کاربری یافت نشد");
  }

  res.status(200).json({
    success: true,
    customer,
  });
};
