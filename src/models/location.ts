import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ILocation extends Document {
  customer: Types.ObjectId;
  name: string;
  latitude: number;
  longitude: number;
  range: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocationModel extends Model<ILocation> {}

const locationSchema = new Schema<ILocation, ILocationModel>({
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  name: { type: String, required: true, trim: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  range: { type: Number, required: true },
}, { timestamps: true });

const Location = mongoose.model<ILocation, ILocationModel>("Location", locationSchema);
export default Location;
