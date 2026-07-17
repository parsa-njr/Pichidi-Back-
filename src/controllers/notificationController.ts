import { Request, Response } from "express";
import Notification from "../models/notification";
import paginate from "../utils/paginate";
import { NotFoundError } from "../errors/customErrors";

export const getNotifications = async (req: Request, res: Response) => {
    const recipient = req.user!.id;
    const recipientRole = req.user!.role as "user" | "customer";

    const { data, pagination } = await paginate(req, Notification, {
        sort: { createdAt: -1 },
        baseFilter: { recipient, recipientRole },
    });

    const unreadCount = await Notification.countDocuments({
        recipient,
        recipientRole,
        isRead: false,
    });

    res.status(200).json({
        success: true,
        unreadCount,
        data: pagination ? { ...pagination, data } : data,
    });
};

export const markNotificationRead = async (req: Request, res: Response) => {
    const recipient = req.user!.id;
    const recipientRole = req.user!.role as "user" | "customer";
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient, recipientRole },
        { $set: { isRead: true } },
        { new: true }
    );

    if (!notification) throw new NotFoundError("اعلان یافت نشد");

    res.status(200).json({ success: true, data: notification });
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
    const recipient = req.user!.id;
    const recipientRole = req.user!.role as "user" | "customer";

    await Notification.updateMany(
        { recipient, recipientRole, isRead: false },
        { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "همه اعلان‌ها خوانده شد" });
};