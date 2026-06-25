import { Request, Response } from "express";
import Customer, { ICustomer } from "../../models/customer";
import Location, { ILocation } from "../../models/location";
import { tryCatch } from "../../utils/tryCatch";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../errors/customErrors";
import locationValidation from "../../validations/locationValidation";
import { searchFilter } from "../../utils/searchFilter";
import paginate from "../../utils/paginate";

// ----------------------------
// 📍 Create a new location
// ----------------------------
export const createLocation = async (req: Request, res: Response) => {
  // Step 1: Check if the customer exists
  const customerId = req.user!.id;
  const customer: ICustomer  | null = await Customer.findById(
    customerId
  );
  if (!customer) throw new NotFoundError("چنین کاربری یافت نشد");

  // Step 2: Validate request body
  const { error } = locationValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  // Step 3: Destructure validated fields
  const { name, latitude, longitude, range } = req.body;

  // Step 4: Create the new location
  await Location.create({
    customer: customerId,
    name,
    latitude,
    longitude,
    range,
  });

  // Step 5: Send success response
  res.status(201).json({
    success: true,
    message: "مکان با موفقیت ایجاد شد",
  });
};

// ----------------------------
// 📍 Get all locations for the current customer (with pagination)
// ----------------------------
export const getAllLocations = async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { search } = req.query;

  const searchQuery = searchFilter(search as string, ["name"]);

  const { data, pagination } = await paginate(req, Location, {
    searchFilter: searchQuery, // 3rd argument in JS version
    sort: { createdAt: -1 }, // 4th argument in JS version
    populate: [], // 5th argument in JS version
    baseFilter: { customer: customerId }, // 6th argument in JS version
  });
  res.status(200).json({
    success: true,
    data: pagination ? { ...pagination, data } : data,
  });
};

// ----------------------------
// 📍 Get a single location by ID
// ----------------------------
export const getLocationById = async (req: Request, res: Response) => {
  const locationId = req.params.locationId;

  const location: ILocation | null = await Location.findById(
    locationId
  );
  if (!location) throw new NotFoundError("محل مورد نظر یافت نشد");

  res.status(200).json({
    success: true,
    data: location,
  });
};

// ----------------------------
// 📍 Update a location
// ----------------------------
export const updateLocation = async (req: Request, res: Response) => {
  const locationId = req.params.locationId;
  const customerId = req.user!.id;

  // Step 1: Check if customer exists
  const customer: ICustomer | null = await Customer.findById(
    customerId
  );
  if (!customer) throw new NotFoundError("چنین کاربری یافت نشد");

  // Step 2: Validate request body
  const { error } = locationValidation.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(" ,");
    throw new UnprocessableEntityError(errorMessage);
  }

  const { name, latitude, longitude, range } = req.body;

  // Step 3: Update location
  const updated: ILocation | null = await Location.findOneAndUpdate(
    { _id: locationId, customer: customerId },
    { $set: { name, latitude, longitude, range } },
    { new: true, runValidators: true }
  );

  if (!updated) throw new NotFoundError("لوکیشن مورد نظر یافت نشد");

  res.status(200).json({
    success: true,
    message: "لوکیشن با موفقیت به‌روزرسانی شد",
  });
};

// ----------------------------
// 📍 Delete a location
// ----------------------------
export const deleteLocation = async (req: Request, res: Response) => {
  const locationId = req.params.locationId;

  const deleted: ILocation | null = await Location.findByIdAndDelete(
    locationId
  );
  if (!deleted) throw new NotFoundError("محل مورد نظر یافت نشد");

  res.status(200).json({
    success: true,
    message: "محل مورد نظر با موفقیت حذف شد",
  });
};
