import Joi from "joi";

export const userValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "نام الزامی است",
    "string.min": "نام باید حداقل ۲ حرف باشد",
    "string.max": "نام نباید بیشتر از ۵۰ حرف باشد",
    "any.required": "نام الزامی است",
  }),

  phone: Joi.string()
    .pattern(/^09\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "شماره تلفن معتبر نیست (باید با 09 شروع شود)",
      "string.empty": "شماره تلفن الزامی است",
      "any.required": "شماره تلفن الزامی است",
    }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "رمز عبور الزامی است",
    "string.min": "رمز عبور باید حداقل ۶ کاراکتر باشد",
    "string.max": "رمز عبور نباید بیشتر از ۳۰ کاراکتر باشد",
    "any.required": "رمز عبور الزامی است",
  }),

  location: Joi.string().length(24).required().messages({
    "string.length": "شناسه موقعیت مکانی معتبر نیست",
    "string.empty": "شناسه موقعیت مکانی الزامی است",
    "any.required": "شناسه موقعیت مکانی الزامی است",
  }),

  shift: Joi.string().length(24).required().messages({
    "string.length": "شناسه شیفت معتبر نیست",
    "string.empty": "شناسه شیفت الزامی است",
    "any.required": "شناسه شیفت الزامی است",
  }),
});

export const updateUserValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "نام الزامی است",
    "string.min": "نام باید حداقل ۲ حرف باشد",
    "string.max": "نام نباید بیشتر از ۵۰ حرف باشد",
    "any.required": "نام الزامی است",
  }),

  phone: Joi.string()
    .pattern(/^09\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "شماره تلفن معتبر نیست (باید با 09 شروع شود)",
      "string.empty": "شماره تلفن الزامی است",
      "any.required": "شماره تلفن الزامی است",
    }),

  password: Joi.string().min(6).max(30).messages({
    "string.empty": "رمز عبور الزامی است",
    "string.min": "رمز عبور باید حداقل ۶ کاراکتر باشد",
    "string.max": "رمز عبور نباید بیشتر از ۳۰ کاراکتر باشد",
  }),

  location: Joi.string().length(24).required().messages({
    "string.length": "شناسه موقعیت مکانی معتبر نیست",
    "string.empty": "شناسه موقعیت مکانی الزامی است",
    "any.required": "شناسه موقعیت مکانی الزامی است",
  }),

  shift: Joi.string().length(24).required().messages({
    "string.length": "شناسه شیفت معتبر نیست",
    "string.empty": "شناسه شیفت الزامی است",
    "any.required": "شناسه شیفت الزامی است",
  }),
});



