import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type RequestType = "leave" | "overtime";
export type RequestStatus = "accepted" | "pending" | "rejected";

export interface IRequest extends Document {
  user: Types.ObjectId;
  requestType: RequestType;
  status: RequestStatus;
  startDate: Date;
  endDate: Date;
  userNote: string;
  customerNote: string;
  customer?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequestModel extends Model<IRequest> {}

const requestSchema = new Schema<IRequest, IRequestModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestType: { type: String, enum: ["leave", "overtime"], required: true },
  status: { type: String, enum: ["accepted", "pending", "rejected"], default: "pending" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  userNote: { type: String, default: "" },
  customerNote: { type: String, default: "" },
  customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

const Request = mongoose.model<IRequest, IRequestModel>("Request", requestSchema);
export default Request;
