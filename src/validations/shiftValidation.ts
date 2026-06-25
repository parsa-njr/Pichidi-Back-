import Joi from "joi";

// Schema for time objects inside shiftDays and exceptionDays
const timeSchema = Joi.object({
  startTime: Joi.string()
  .trim()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm 24-hour format
    .required()
    .messages({
      "string.pattern.base": "زمان شروع باید به صورت HH:mm باشد",
      "string.empty": "زمان شروع الزامی است",
      "any.required": "زمان شروع الزامی است",
    }),
  endTime: Joi.string()
  .trim()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm 24-hour format
    .required()
    .messages({
      "string.pattern.base": "زمان پایان باید به صورت HH:mm باشد",
      "string.empty": "زمان پایان الزامی است",
      "any.required": "زمان پایان الزامی است",
    }),
});

// Schema for each shiftDay
const shiftDaySchema = Joi.object({
  day: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": "روز باید عدد باشد",
      "any.required": "روز الزامی است",
    }),
  time: Joi.array().items(timeSchema).required().messages({
    "any.required": "زمان‌ها الزامی هستند",
  }),
  isOffDay: Joi.boolean().default(false).messages({
    "boolean.base": "offDay باید مقدار بولین باشد",
  }),
});

// Schema for each exceptionDay
const exceptionDaySchema = Joi.object({

  date: Joi.date().required().messages({
    "date.base": "تاریخ باید یک تاریخ معتبر باشد",
    "any.required": "تاریخ الزامی است",
  }),
  time: Joi.array().items(timeSchema).required().messages({
    "any.required": "زمان‌ها الزامی هستند",
  }),
 
});

// Main shift validation schema
 export const shiftValidation = Joi.object({
  shiftName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "نام شیفت الزامی است",
    "string.min": "نام شیفت باید حداقل ۲ حرف باشد",
    "string.max": "نام شیفت نباید بیشتر از ۵۰ حرف باشد",
    "any.required": "نام شیفت الزامی است",
  }),
  startDate: Joi.date().required().messages({
    "date.base": "تاریخ شروع باید معتبر باشد",
    "any.required": "تاریخ شروع الزامی است",
  }),
  endDate: Joi.date().required().messages({
    "date.base": "تاریخ پایان باید معتبر باشد",
    "any.required": "تاریخ پایان الزامی است",
  }),
  formalHolidays: Joi.boolean().optional(),
  shiftDays: Joi.array().items(shiftDaySchema).optional(),
  exceptionDays: Joi.array().items(exceptionDaySchema).optional(),
});

