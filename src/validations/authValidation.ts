import Joi from "joi";

// ----------------------------
// Signup Validation Schema
// ----------------------------
export const signupValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "نام کاربری باید یک رشته باشد.",
    "string.empty": "نام کاربری نمی‌تواند خالی باشد.",
    "string.min": "نام کاربری باید حداقل ۳ کاراکتر باشد.",
    "string.max": "نام کاربری نباید بیش از ۳۰ کاراکتر باشد.",
    "any.required": "نام کاربری الزامی است.",
  }),
  phone: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required()
    .messages({
      "string.base": "شماره تلفن باید یک رشته باشد.",
      "string.empty": "شماره تلفن نمی‌تواند خالی باشد.",
      "string.pattern.base": "شماره تلفن باید ۱۱ رقم باشد و با 09 شروع شود.",
      "any.required": "شماره تلفن الزامی است.",
    }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.base": "رمز عبور باید یک رشته باشد.",
    "string.empty": "رمز عبور نمی‌تواند خالی باشد.",
    "string.min": "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    "string.max": "رمز عبور نباید بیش از ۵۰ کاراکتر باشد.",
    "any.required": "رمز عبور الزامی است.",
  }),
});

// ----------------------------
// Login Validation Schema
// ----------------------------
export const loginValidation = Joi.object({
  phone: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required()
    .messages({
      "string.base": "شماره تلفن باید یک رشته باشد.",
      "string.empty": "شماره تلفن نمی‌تواند خالی باشد.",
      "string.pattern.base": "شماره تلفن باید ۱۱ رقم باشد و با 09 شروع شود.",
      "any.required": "شماره تلفن الزامی است.",
    }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.base": "رمز عبور باید یک رشته باشد.",
    "string.empty": "رمز عبور نمی‌تواند خالی باشد.",
    "string.min": "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    "string.max": "رمز عبور نباید بیش از ۵۰ کاراکتر باشد.",
    "any.required": "رمز عبور الزامی است.",
  }),
});

// ----------------------------
// OTP Verification Schema
// ----------------------------
export const otpValidation = Joi.object({
  phone: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required()
    .messages({
      "string.base": "شماره تلفن باید یک رشته باشد.",
      "string.empty": "شماره تلفن نمی‌تواند خالی باشد.",
      "string.pattern.base": "شماره تلفن باید ۱۱ رقم باشد و با 09 شروع شود.",
      "any.required": "شماره تلفن الزامی است.",
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.base": "کد تایید باید یک رشته باشد.",
      "string.empty": "کد تایید نمی‌تواند خالی باشد.",
      "string.length": "کد تایید باید دقیقاً ۶ رقم باشد.",
      "string.pattern.base": "کد تایید باید عددی ۶ رقمی باشد.",
      "any.required": "کد تایید الزامی است.",
    }),
});
