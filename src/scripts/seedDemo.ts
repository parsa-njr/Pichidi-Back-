// src/scripts/seedDemo.ts
//
// یک اسکریپت سید برای تست اپ: یک کاستومر، یک لوکیشن، یک شیفت، چند یوزر
// و برای هر یوزر تاریخچه‌ی ورود/خروج (attendance) به مدت ۳۰ روز گذشته می‌سازه
// (با کمی غیبت، تاخیر و مرخصی تصادفی تا داده‌ها واقعی‌تر باشن).
//
// اجرا:
//   npx tsx src/scripts/seedDemo.ts
// یا اضافه کردن به package.json:
//   "seed": "tsx src/scripts/seedDemo.ts"
//   npm run seed
//
// ⚠️ این اسکریپت داده‌های قبلی این کاستومر رو پاک می‌کنه (اگه با همین شماره وجود داشته باشه)
// و از اجرا روی NODE_ENV=production جلوگیری می‌کنه.

import "dotenv/config";
import mongoose from "mongoose";
import { connectToDb } from "../config/database";

import Customer from "../models/customer";
import Location from "../models/location";
import Shift from "../models/shift";
import User from "../models/user";
import Attendance from "../models/attendance";
import RequestModel from "../models/request";

// ----------------------------
// تنظیمات قابل تغییر
// ----------------------------
const CUSTOMER_PHONE = "09120000001";
const CUSTOMER_PASSWORD = "123456";
const CUSTOMER_NAME = "شرکت تست پیچیده";

const USER_PASSWORD = "123456";
const USERS = [
    { name: "علی رضایی", phone: "09120000011" },
    { name: "سارا احمدی", phone: "09120000012" },
    { name: "محمد کریمی", phone: "09120000013" },
    { name: "نگار حسینی", phone: "09120000014" },
];

const DAYS_OF_HISTORY = 30; // چند روز گذشته را برای حضور و غیاب بسازیم
const WORK_START = "09:00";
const WORK_END = "17:00";
const OFF_DAYS = [5, 6]; // isoWeekday: 5=جمعه, 6=شنبه به عنوان تعطیل (دلخواه - تغییر بده)

// ----------------------------
// کمک‌تابع‌ها
// ----------------------------
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function dateAtUTC(daysAgo: number, hour = 0, minute = 0) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    const withTime = new Date(d);
    withTime.setUTCHours(hour, minute, 0, 0);
    return withTime;
}

function isoWeekday(date: Date) {
    // 1=دوشنبه ... 7=یکشنبه (مطابق چیزی که moment().isoWeekday() برمی‌گردونه)
    const jsDay = date.getUTCDay(); // 0=Sunday ... 6=Saturday
    return jsDay === 0 ? 7 : jsDay;
}

function parseTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    return { h, m };
}

// ----------------------------
// اجرای اصلی
// ----------------------------
async function main() {
    if (process.env.NODE_ENV === "production") {
        console.error("❌ این اسکریپت روی محیط production اجرا نمی‌شود.");
        process.exit(1);
    }

    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Attendance";
    await connectToDb(MONGO_URI);

    console.log("🌱 شروع سید کردن داده‌های تست...");

    // ── پاکسازی داده‌های قبلی همین کاستومر (در صورت وجود) ──────────────
    const existingCustomer = await Customer.findOne({ phone: CUSTOMER_PHONE });
    if (existingCustomer) {
        console.log("🧹 پاک کردن داده‌های قبلی کاستومر تست...");
        const oldUsers = await User.find({ customer: existingCustomer._id }).select("_id");
        const oldUserIds = oldUsers.map((u) => u._id);

        await Attendance.deleteMany({ user: { $in: oldUserIds } });
        await RequestModel.deleteMany({ customer: existingCustomer._id });
        await User.deleteMany({ customer: existingCustomer._id });
        await Location.deleteMany({ customer: existingCustomer._id });
        await Shift.deleteMany({ customer: existingCustomer._id });
        await Customer.deleteOne({ _id: existingCustomer._id });
    }

    // ── ساخت کاستومر ────────────────────────────────────────────────
    const customer = new Customer({
        name: CUSTOMER_NAME,
        phone: CUSTOMER_PHONE,
        password: CUSTOMER_PASSWORD, // در pre-save هش می‌شود
    });
    await customer.save();
    console.log(`✅ کاستومر ساخته شد: ${customer.name} (${customer.phone}) — پسورد: ${CUSTOMER_PASSWORD}`);

    // ── ساخت لوکیشن ─────────────────────────────────────────────────
    const location = await Location.create({
        customer: customer._id,
        name: "دفتر مرکزی",
        latitude: 35.6892,
        longitude: 51.389,
        range: 200, // متر
    });
    console.log(`✅ لوکیشن ساخته شد: ${location.name}`);

    // ── ساخت شیفت (کل هفته، با روزهای تعطیل مشخص) ───────────────────
    const shiftDays = Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        const isOffDay = OFF_DAYS.includes(day);
        return {
            day,
            isOffDay,
            time: isOffDay ? [] : [{ startTime: WORK_START, endTime: WORK_END }],
        };
    });

    const shift = await Shift.create({
        customer: customer._id,
        shiftName: "شیفت اداری",
        startDate: dateAtUTC(DAYS_OF_HISTORY + 10),
        endDate: dateAtUTC(-365), // یک سال جلوتر
        formalHolidays: false,
        shiftDays,
        exceptionDays: [],
    });
    console.log(`✅ شیفت ساخته شد: ${shift.shiftName}`);

    // ── ساخت یوزرها ─────────────────────────────────────────────────
    const users = [];
    for (const u of USERS) {
        const user = new User({
            name: u.name,
            phone: u.phone,
            password: USER_PASSWORD, // در pre-save هش می‌شود
            location: location._id,
            shift: shift._id,
            customer: customer._id,
        });
        await user.save();
        customer.users.push(user._id);
        users.push(user);
        console.log(`✅ یوزر ساخته شد: ${user.name} (${user.phone}) — پسورد: ${USER_PASSWORD}`);
    }
    await customer.save();

    // ── ساخت attendance برای هر یوزر در N روز گذشته ──────────────────
    console.log(`🕒 در حال ساخت تاریخچه‌ی ${DAYS_OF_HISTORY} روزه‌ی حضور و غیاب...`);

    let attendanceCount = 0;
    let leaveRequestCount = 0;

    for (const user of users) {
        for (let d = DAYS_OF_HISTORY; d >= 1; d--) {
            const day = dateAtUTC(d);
            const weekday = isoWeekday(day);

            if (OFF_DAYS.includes(weekday)) continue; // روز تعطیل شیفت - رکوردی نمی‌سازیم

            const roll = Math.random();

            if (roll < 0.08) {
                // ~۸٪ غیبت ساده (بدون رکورد attendance و بدون مرخصی ثبت‌شده)
                continue;
            }

            if (roll < 0.13) {
                // ~۵٪ مرخصی تایید شده برای کل روز
                const start = parseTime(WORK_START);
                const end = parseTime(WORK_END);
                await RequestModel.create({
                    user: user._id,
                    customer: customer._id,
                    requestType: "leave",
                    status: "accepted",
                    startDate: dateAtUTC(d, start.h, start.m),
                    endDate: dateAtUTC(d, end.h, end.m),
                    userNote: "مرخصی استعلاجی",
                    customerNote: "",
                    reviewedAt: dateAtUTC(d),
                });
                leaveRequestCount++;
                continue;
            }

            // حالت عادی: حضور با کمی تاخیر/زودتر رفتن تصادفی
            const delayMinutes = roll < 0.3 ? rand(10, 40) : rand(-5, 5); // ~۱۷٪ با تاخیر محسوس
            const overtimeMinutes = roll > 0.85 ? rand(15, 60) : rand(-10, 10);

            const startBase = parseTime(WORK_START);
            const endBase = parseTime(WORK_END);

            const checkIn = dateAtUTC(d, startBase.h, startBase.m);
            checkIn.setUTCMinutes(checkIn.getUTCMinutes() + Math.max(delayMinutes, 0));

            const checkOut = dateAtUTC(d, endBase.h, endBase.m);
            checkOut.setUTCMinutes(checkOut.getUTCMinutes() + overtimeMinutes);

            await Attendance.create({
                user: user._id,
                date: dateAtUTC(d),
                sessions: [{ checkIn, checkOut }],
            });
            attendanceCount++;
        }
    }

    console.log(`✅ ${attendanceCount} رکورد حضور ساخته شد.`);
    console.log(`✅ ${leaveRequestCount} درخواست مرخصی (تایید شده) ساخته شد.`);

    // ── چند درخواست pending برای تست پنل کاستومر ─────────────────────
    const pendingSamples = users.slice(0, 2);
    for (const user of pendingSamples) {
        await RequestModel.create({
            user: user._id,
            customer: customer._id,
            requestType: "overtime",
            status: "pending",
            startDate: dateAtUTC(1, 17, 0),
            endDate: dateAtUTC(1, 20, 0),
            userNote: "پروژه فوری - نیاز به اضافه‌کاری",
        });
    }
    console.log(`✅ ${pendingSamples.length} درخواست اضافه‌کاری در وضعیت pending ساخته شد.`);

    console.log("\n🎉 سید با موفقیت انجام شد!\n");
    console.log("──────────────────────────────");
    console.log("اطلاعات ورود کاستومر:");
    console.log(`  شماره: ${CUSTOMER_PHONE}`);
    console.log(`  رمز:   ${CUSTOMER_PASSWORD}`);
    console.log("اطلاعات ورود یوزرها:");
    USERS.forEach((u) => console.log(`  ${u.name} — ${u.phone} / ${USER_PASSWORD}`));
    console.log("──────────────────────────────\n");
}

main()
    .catch((err) => {
        console.error("❌ خطا در اجرای اسکریپت سید:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
        console.log("🔌 اتصال دیتابیس بسته شد.");
        process.exit();
    });