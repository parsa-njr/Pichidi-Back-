import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface ITime {
  startTime: string;
  endTime: string;
}

interface IShiftDay {
  day: number;
  isOffDay: boolean;
  time: ITime[];
}

interface IExceptionDay {
  date: Date;
  time: ITime[];
}

export interface IShift extends Document {
  customer: Types.ObjectId;
  shiftName: string;
  startDate: Date;
  endDate: Date;
  formalHolidays: boolean;
  shiftDays: IShiftDay[];
  exceptionDays: IExceptionDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IShiftModel extends Model<IShift> {}

const timeSchema = new Schema<ITime>({ startTime: String, endTime: String }, { _id: false });
const shiftDaySchema = new Schema<IShiftDay>({
  day: { type: Number, required: true },
  isOffDay: { type: Boolean, default: false },
  time: { type: [timeSchema], required: true },
}, { _id: false });

const exceptionDaySchema = new Schema<IExceptionDay>({
  date: { type: Date, required: true },
  time: { type: [timeSchema], required: true },
}, { _id: false });

const shiftSchema = new Schema<IShift, IShiftModel>({
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  shiftName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  formalHolidays: { type: Boolean, default: false },
  shiftDays: { type: [shiftDaySchema], default: [] },
  exceptionDays: { type: [exceptionDaySchema], default: [] },
}, { timestamps: true });

const Shift = mongoose.model<IShift, IShiftModel>("Shift", shiftSchema);
export default Shift;
