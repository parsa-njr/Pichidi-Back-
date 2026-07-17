import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type NotificationRecipientRole = "user" | "customer";
export type NotificationType =
    | "request_created"
    | "request_accepted"
    | "request_rejected";

export interface INotification extends Document {
    recipient: Types.ObjectId;
    recipientRole: NotificationRecipientRole;
    type: NotificationType;
    title: string;
    message: string;
    request?: Types.ObjectId | null;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface INotificationModel extends Model<INotification> { }

const notificationSchema = new Schema<INotification, INotificationModel>(
    {
        recipient: { type: Schema.Types.ObjectId, required: true },
        recipientRole: { type: String, enum: ["user", "customer"], required: true },
        type: {
            type: String,
            enum: ["request_created", "request_accepted", "request_rejected"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        request: { type: Schema.Types.ObjectId, ref: "Request", default: null },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, recipientRole: 1, createdAt: -1 });

const Notification = mongoose.model<INotification, INotificationModel>(
    "Notification",
    notificationSchema
);
export default Notification;