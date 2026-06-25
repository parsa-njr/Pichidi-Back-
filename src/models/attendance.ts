import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISession {
  checkIn?: Date;
  checkOut?: Date;
}

export interface IAttendance extends Document {
  user: Types.ObjectId;
  date: Date;
  sessions: ISession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceModel extends Model<IAttendance> {}

const sessionSchema = new Schema<ISession>({ 
  checkIn: Date, 
  checkOut: Date 
}, { _id: false });

const attendanceSchema = new Schema<IAttendance, IAttendanceModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  sessions: [sessionSchema],
}, { timestamps: true });

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance, IAttendanceModel>("Attendance", attendanceSchema);
export default Attendance;
