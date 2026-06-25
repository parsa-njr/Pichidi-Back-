import { format } from "date-fns";
import moment from "moment-jalaali";
import { toGregorian, jalaaliMonthLength } from "jalaali-js";

// ----------------------------
// Types
// ----------------------------

export interface IShiftTime {
  startTime: string;
  endTime: string;
}

export interface IShiftDay {
  day: number; // 1 = Monday, 7 = Sunday
  time: IShiftTime[];
  isOffDay: boolean;
}

export interface IExceptionDay {
  date: Date;
  time: IShiftTime[];
}

export interface IShiftConfig {
  startDate: Date;
  endDate: Date;
  shiftDays: IShiftDay[];
  exceptionDays?: IExceptionDay[];
}

export interface IAttendanceSession {
  checkIn?: Date | string;
  checkOut?: Date | string;
}

export interface IAttendanceRecord {
  date: Date;
  sessions: IAttendanceSession[];
}

export interface IRequest {
  status: "accepted" | "pending" | "rejected";
  requestType: "leave" | "extraTime";
  startDate: Date;
  endDate: Date;
}

// Calendar output type
export interface IWorkCalendarDay {
  date: string; // Gregorian
  shamsiDate: string; // Persian
  isOffDay: boolean;
  isExceptionDay: boolean;
  time: IShiftTime[];
}

// Detailed report per day
export interface IDailyAttendanceReport {
  date: string;
  shamsiDate: string;
  expectedStart?: string;
  expectedEnd?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  plannedMinutes?: string;
  actualMinutes?: string;
  leaveMinutes?: string;
  extraTimeRequestMinutes?: string;
  delayMinutes?: string;
  deficitMinutes?: string;
  overtimeMinutes?: string;
  isOffDay?: boolean;
  sessions?: {
    checkIn: string;
    checkOut: string;
    duration: string;
  }[];
  status: string;
}

// ----------------------------

export function calculateDetailedAttendanceReport(
  calendar: IWorkCalendarDay[],
  attendanceRecords: IAttendanceRecord[],
  requests: IRequest[],
  shiftDefinition: IShiftConfig
): IDailyAttendanceReport[] {
  const report: IDailyAttendanceReport[] = [];
  const requestsMap = mapRequestsByDateTime(requests);

  // Step 1: determine min and max attendance dates
  const attendanceDates = attendanceRecords.map(r => moment(r.date).format("YYYY-MM-DD"));
  const minDate = moment.min(attendanceDates.map(d => moment(d))).format("YYYY-MM-DD");
  const maxDate = moment.max(attendanceDates.map(d => moment(d))).format("YYYY-MM-DD");

  // Step 2: filter calendar days within attendance range
  const filteredCalendar = calendar.filter(day => day.date >= minDate && day.date <= maxDate);

  // Map exception days
    // @ts-ignore
  const exceptionMap: Record<string, IShiftConfig["exceptionDays"][0]["time"]> = {};
  shiftDefinition?.exceptionDays?.forEach(ex => {
    const dateStr = moment(ex.date).format("YYYY-MM-DD");
    exceptionMap[dateStr] = ex.time;
  });

  // Map weekdays to shiftDays
  const shiftDaysMap: Record<number, IShiftConfig["shiftDays"][0]> = {};
  shiftDefinition?.shiftDays?.forEach(day => {
    shiftDaysMap[day.day] = day;
  });

  // Process each day
  for (const day of filteredCalendar) {
    const dateStr = day.date;
    const shamsiDate = convertToShamsiEnglish(dateStr);
    const weekday = moment(dateStr).isoWeekday();
    const exceptionTime = exceptionMap[dateStr];
    const shiftDay = shiftDaysMap[weekday];

    let plannedStart: moment.Moment;
    let plannedEnd: moment.Moment;
    let isOffDay = false;

    if (exceptionTime?.length) {
      plannedStart = moment(`${dateStr}T${exceptionTime[0].startTime}`);
      plannedEnd = moment(`${dateStr}T${exceptionTime[0].endTime}`);
    } else if (shiftDay?.time?.length) {
      isOffDay = shiftDay.isOffDay;
      plannedStart = moment(`${dateStr}T${shiftDay.time[0].startTime}`);
      plannedEnd = moment(`${dateStr}T${shiftDay.time[0].endTime}`);
    } else {
      report.push({ date: dateStr, shamsiDate, status: "invalidShiftDay" });
      continue;
    }

    const plannedDuration = plannedEnd.diff(plannedStart, "minutes");

    const attendance = attendanceRecords.find(
      rec => moment(rec.date).format("YYYY-MM-DD") === dateStr
    );

    const dayRequests = requestsMap[dateStr] || [];
    const leaveRanges = dayRequests.filter(r => r.type === "leave");
    const extraRanges = dayRequests.filter(r => r.type === "extraTime");
    const leaveMinutes = sumOverlapMinutes(plannedStart, plannedEnd, leaveRanges, dateStr);

    if (attendance && attendance.sessions.length > 0) {
      let totalActualDuration = 0;
      let firstCheckIn: moment.Moment | null = null;
      let lastCheckOut: moment.Moment | null = null;
      const allSessions: IDailyAttendanceReport["sessions"] = [];

      for (const session of attendance.sessions) {
        if (session.checkIn && session.checkOut) {
          const checkIn = moment(session.checkIn);
          const checkOut = moment(session.checkOut);

          if (!firstCheckIn || checkIn.isBefore(firstCheckIn)) firstCheckIn = checkIn;
          if (!lastCheckOut || checkOut.isAfter(lastCheckOut)) lastCheckOut = checkOut;

          const sessionDuration = checkOut.diff(checkIn, "minutes");
          totalActualDuration += sessionDuration;

          allSessions.push({
            checkIn: checkIn.format("HH:mm"),
            checkOut: checkOut.format("HH:mm"),
            duration: minutesToTime(sessionDuration),
          });
        }
      }

      if (firstCheckIn && lastCheckOut) {
        const delay = Math.max(0, firstCheckIn.diff(plannedStart, "minutes"));
        const extraMinutes = sumOverlapMinutes(lastCheckOut, moment(`${dateStr}T23:59`), extraRanges, dateStr);

        const deficit = isOffDay ? 0 : Math.max(0, plannedDuration - totalActualDuration - leaveMinutes);
        const overtime = isOffDay ? totalActualDuration : Math.max(0, totalActualDuration - plannedDuration - extraMinutes);

        if (plannedDuration !== leaveMinutes) {
          report.push({
            date: dateStr,
            shamsiDate,
            expectedStart: plannedStart.format("HH:mm"),
            expectedEnd: plannedEnd.format("HH:mm"),
            actualCheckIn: firstCheckIn.format("HH:mm"),
            actualCheckOut: lastCheckOut.format("HH:mm"),
            plannedMinutes: minutesToTime(plannedDuration),
            actualMinutes: minutesToTime(totalActualDuration),
            leaveMinutes: minutesToTime(leaveMinutes),
            extraTimeRequestMinutes: minutesToTime(extraMinutes),
            delayMinutes: minutesToTime(delay),
            deficitMinutes: minutesToTime(deficit),
            overtimeMinutes: minutesToTime(overtime),
            isOffDay,
            sessions: allSessions,
            status: delay > 0 ? "delay" : deficit > 0 ? "deficit" : "fullPresent",
          });
        } else {
          report.push({
            date: dateStr,
            shamsiDate,
            expectedStart: plannedStart.format("HH:mm"),
            expectedEnd: plannedEnd.format("HH:mm"),
            sessions: allSessions,
            status: "leave",
          });
        }
      } else {
        report.push({
          date: dateStr,
          shamsiDate,
          expectedStart: plannedStart.format("HH:mm"),
          expectedEnd: plannedEnd.format("HH:mm"),
          sessions: allSessions,
          status: "incompleteEntryExit",
        });
      }
    } else {
      const isFullDayLeave = leaveRanges.some(r => r.from === "00:00" && r.to === "23:59") || plannedDuration === leaveMinutes;
      if (isFullDayLeave) {
        report.push({
          date: dateStr,
          shamsiDate,
          expectedStart: plannedStart.format("HH:mm"),
          expectedEnd: plannedEnd.format("HH:mm"),
          status: "leave",
        });
      } else if (!isOffDay) {
        report.push({
          date: dateStr,
          shamsiDate,
          expectedStart: plannedStart.format("HH:mm"),
          expectedEnd: plannedEnd.format("HH:mm"),
          status: "absent",
        });
      } else {
        report.push({
          date: dateStr,
          shamsiDate,
          status: "shiftOffDay",
        });
      }
    }
  }

  return report;
}
// Time Utilities
// ----------------------------

export const formatTime = (date?: Date | null) =>
  !date ? "--:--" : format(new Date(date), "hh:mm a");

export const formatMinutesToXhYm = (minutes?: number) => {
  if (!minutes || isNaN(minutes)) return "0h";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim();
};

export const timeToMinutes = (timeStr?: string) => {
  if (!timeStr || timeStr === "--:--") return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

export const minutesToTime = (tminute: number) => {
  const hours = Math.floor(tminute / 60);
  const minutes = tminute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// ----------------------------
// Persian Date Utilities
// ----------------------------

export const getPersianDateRange = (jYear: number, jMonth: number) => {
  if (!Number.isInteger(jYear) || !Number.isInteger(jMonth))
    throw new Error("Invalid Jalali year or month");

  const startGreg = toGregorian(jYear, jMonth, 1);
  const daysInMonth = jalaaliMonthLength(jYear, jMonth);
  const endGreg = toGregorian(jYear, jMonth, daysInMonth);

  const startDate = new Date(Date.UTC(startGreg.gy, startGreg.gm - 1, startGreg.gd, 0, 0, 0));
  const endDate = new Date(Date.UTC(endGreg.gy, endGreg.gm - 1, endGreg.gd, 0, 0, 0));

  return { startDate, endDate, daysInMonth };
};

// ----------------------------
// Work Calendar
// ----------------------------

export function generateWorkCalendar(shiftConfig: IShiftConfig): IWorkCalendarDay[] {
  const calendar: IWorkCalendarDay[] = [];
  const exceptionMap: Record<string, IShiftTime[]> = {};

  if (shiftConfig.exceptionDays?.length) {
    for (const ex of shiftConfig.exceptionDays) {
      const dateStr = moment(ex.date).format("YYYY-MM-DD");
      exceptionMap[dateStr] = ex.time;
    }
  }

  let currentDate = moment(shiftConfig.startDate);
  const endDate = moment(shiftConfig.endDate);

  while (currentDate.isSameOrBefore(endDate)) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    const weekdayIndex = (currentDate.isoWeekday() - 1) % 7;
    const isExceptionDay = !!exceptionMap[dateStr];
    const exceptionTime = exceptionMap[dateStr] || [];

    let time: IShiftTime[] = [];
    let isOffDay = false;

    if (isExceptionDay) time = exceptionTime;
    else {
      const shiftDay = shiftConfig.shiftDays[weekdayIndex];
      if (shiftDay) {
        time = shiftDay.time;
        isOffDay = shiftDay.isOffDay;
      }
    }

    calendar.push({
      date: dateStr,
      shamsiDate: convertToShamsiEnglish(dateStr),
      isOffDay,
      isExceptionDay,
      time,
    });

    currentDate.add(1, "day");
  }

  return calendar;
}

export function convertToShamsiEnglish(gregorianDate: string): string {
  const date = new Date(gregorianDate);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "persian",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";

  return `${year}/${month}/${day}`;
}

// ----------------------------
// Attendance Report
// ----------------------------

export function mapRequestsByDateTime(requests: IRequest[]) {
  const map: Record<string, { type: string; from: string; to: string }[]> = {};

  for (const req of requests) {
    if (req.status !== "accepted") continue;

    const start = moment(req.startDate);
    const end = moment(req.endDate);
    const isSameDay = start.isSame(end, "day");

    if (isSameDay) {
      const dateStr = start.format("YYYY-MM-DD");
      map[dateStr] = map[dateStr] || [];
      map[dateStr].push({
        type: req.requestType,
        from: start.format("HH:mm"),
        to: end.format("HH:mm"),
      });
    } else {
      for (let d = start.clone().startOf("day"); d.isSameOrBefore(end); d.add(1, "day")) {
        const dateStr = d.format("YYYY-MM-DD");
        map[dateStr] = map[dateStr] || [];
        map[dateStr].push({
          type: req.requestType,
          from: d.isSame(start, "day") ? start.format("HH:mm") : "00:00",
          to: d.isSame(end, "day") ? end.format("HH:mm") : "23:59",
        });
      }
    }
  }

  return map;
}

export function sumOverlapMinutes(
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  ranges: { from: string; to: string }[],
  date: string
) {
  let total = 0;
  for (const r of ranges) {
    const from = moment(`${date}T${r.from}`);
    const to = moment(`${date}T${r.to}`);
    const overlapStart = moment.max(rangeStart, from);
    const overlapEnd = moment.min(rangeEnd, to);
    if (overlapEnd.isAfter(overlapStart)) total += overlapEnd.diff(overlapStart, "minutes");
  }
  return total;
}

// ----------------------------
// Summarize attendance
// ----------------------------

export function summarizeAttendance(data: IDailyAttendanceReport[]) {
  let totalPlanned = 0;
  let totalActual = 0;
  let totalLeave = 0;
  let totalOvertime = 0;
  let totalDelay = 0;
  let totalDeficit = 0;

  const statusCount: Record<string, number> = {
    fullPresent: 0,
    delay: 0,
    deficit: 0,
    absent: 0,
    leave: 0,
    shiftOffDay: 0,
  };

  for (const day of data) {
    statusCount[day.status] = (statusCount[day.status] || 0) + 1;
    totalPlanned += timeToMinutes(day.plannedMinutes);
    totalActual += timeToMinutes(day.actualMinutes);
    totalLeave += timeToMinutes(day.leaveMinutes);
    totalOvertime += timeToMinutes(day.overtimeMinutes);
    totalDelay += timeToMinutes(day.delayMinutes);
    totalDeficit += timeToMinutes(day.deficitMinutes);
  }

  return {
    totalPlannedTime: minutesToTime(totalPlanned),
    totalActualTime: minutesToTime(totalActual),
    totalLeaveTime: minutesToTime(totalLeave),
    totalOvertime: minutesToTime(totalOvertime),
    totalDelay: minutesToTime(totalDelay),
    totalDeficit: minutesToTime(totalDeficit),
    statusCount,
  };
}
