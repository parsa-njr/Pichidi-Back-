import Joi from "joi";

// Validation schema for Location
export const locationValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "نام الزامی است",
    "string.min": "نام باید حداقل ۲ حرف باشد",
    "string.max": "نام نباید بیشتر از ۵۰ حرف باشد",
    "any.required": "نام الزامی است",
  }),

  latitude: Joi.number().required().messages({
    "number.base": "مقدار عرض جغرافیایی باید عدد باشد",
    "any.required": "مقدار عرض جغرافیایی الزامی است",
  }),

  longitude: Joi.number().required().messages({
    "number.base": "مقدار طول جغرافیایی باید عدد باشد",
    "any.required": "مقدار طول جغرافیایی الزامی است",
  }),

  range: Joi.number().required().messages({
    "number.base": "مقدار محدوده باید عدد باشد",
    "any.required": "مقدار محدوده الزامی است",
  }),
});

export default locationValidation;
