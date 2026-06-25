import Joi from "joi";

export const updateRequestStatusValidation = Joi.object({
  status: Joi.string().valid("accepted", "rejected").required().messages({
    "any.only": "وضعیت فقط می‌تواند 'accepted' یا 'rejected' باشد.",
    "string.base": "وضعیت باید یک رشته باشد.",
    "any.required": "وضعیت الزامی است.",
  }),

  customerNote: Joi.string().allow("").max(500).messages({
    "string.base": "یادداشت  باید یک رشته باشد.",
    "string.max": "یادداشت  نمی‌تواند بیش از ۵۰۰ کاراکتر باشد.",
  }),
});


export const requestValidation = Joi.object({
  requestType: Joi.string().valid("leave", "overtime").required().messages({
    "any.required": "نوع درخواست الزامی است.",
    "any.only": "نوع درخواست باید یکی از 'leave' یا 'overtime' باشد.",
    "string.base": "نوع درخواست باید یک رشته باشد.",
  }),

  startDate: Joi.date().iso().required().messages({
    "any.required": "تاریخ شروع الزامی است.",
    "date.base": "تاریخ شروع باید یک تاریخ معتبر باشد.",
    "date.format": "تاریخ شروع باید به فرمت ISO باشد.",
  }),

  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "any.required": "تاریخ پایان الزامی است.",
    "date.base": "تاریخ پایان باید یک تاریخ معتبر باشد.",
    "date.format": "تاریخ پایان باید به فرمت ISO باشد.",
    "date.greater": "تاریخ پایان باید بعد از تاریخ شروع باشد.",
  }),

  userNote: Joi.string().allow("").messages({
    "string.base": "یادداشت باید از نوع رشته باشد.",
  }),
});
