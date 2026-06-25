import Joi from "joi";

const profileValidation = Joi.object({
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
    "string.min": "رمز عبور باید حداقل ۶ کاراکتر باشد",
    "string.max": "رمز عبور نباید بیشتر از ۳۰ کاراکتر باشد",
  }),
});

export default profileValidation;

