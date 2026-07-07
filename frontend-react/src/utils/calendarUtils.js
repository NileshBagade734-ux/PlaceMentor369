const EVENT_TYPE_META = {
  "Job Application Deadline": {
    icon: "calendar-x",
    color: "red",
    accent: "from-red-500 to-rose-500"
  },
  "Aptitude Test": {
    icon: "brain",
    color: "indigo",
    accent: "from-indigo-500 to-violet-500"
  },
  "Technical Interview": {
    icon: "code-2",
    color: "emerald",
    accent: "from-emerald-500 to-teal-500"
  },
  "HR Interview": {
    icon: "users",
    color: "orange",
    accent: "from-orange-500 to-amber-500"
  },
  "Group Discussion": {
    icon: "messages-square",
    color: "blue",
    accent: "from-sky-500 to-blue-500"
  },
  "Coding Round": {
    icon: "terminal-square",
    color: "purple",
    accent: "from-purple-500 to-fuchsia-500"
  },
  "Offer Letter": {
    icon: "badge-check",
    color: "green",
    accent: "from-green-500 to-emerald-500"
  },
  "Offer Acceptance Deadline": {
    icon: "hourglass",
    color: "red",
    accent: "from-red-500 to-orange-500"
  },
  "Document Verification": {
    icon: "file-check",
    color: "slate",
    accent: "from-slate-500 to-slate-600"
  },
  "Joining Date": {
    icon: "rocket",
    color: "green",
    accent: "from-green-500 to-lime-500"
  }
};

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "amber",
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20"
  },
  completed: {
    label: "Completed",
    color: "slate",
    chip: "bg-slate-500/10 text-slate-600 border-slate-500/20"
  }
};

const DAY_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  month: "short",
  day: "numeric"
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit"
});

const pad = (value) => String(value).padStart(2, "0");

const toDateOnlyKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

export const getEventTypeMeta = (eventType) => EVENT_TYPE_META[eventType] || {
  icon: "calendar-days",
  color: "slate",
  accent: "from-slate-500 to-slate-600"
};

export const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.pending;

export const formatShortDate = (date) => DAY_FORMATTER.format(new Date(date));

export const formatLongDate = (date) => LONG_DATE_FORMATTER.format(new Date(date));

export const formatTime = (time) => {
  if (!time) return "—";
  const [hours = "09", minutes = "00"] = String(time).split(":");
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);
  return TIME_FORMATTER.format(parsed);
};

export const getDaysUntil = (date) => {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getReminderLabel = (event) => {
  const days = getDaysUntil(event.date);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return "This week";
  return null;
};

export const isSameDay = (left, right) => toDateOnlyKey(left) === toDateOnlyKey(right);

export const groupEventsByDate = (events = []) => {
  return events.reduce((accumulator, event) => {
    const key = toDateOnlyKey(event.date);
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(event);
    return accumulator;
  }, {});
};

export const sortEvents = (events = []) => {
  return [...events].sort((left, right) => {
    const dateDelta = new Date(left.date) - new Date(right.date);
    if (dateDelta !== 0) return dateDelta;
    return String(left.time || "").localeCompare(String(right.time || ""));
  });
};

export const getUpcomingEvents = (events = [], limit = 5) => {
  const now = new Date();

  return sortEvents(events)
    .filter((event) => new Date(event.date) >= now)
    .slice(0, limit);
};

export const getNextInterview = (events = []) => {
  const upcomingInterviews = sortEvents(events).filter((event) =>
    /interview|round/i.test(event.eventType)
  );

  return upcomingInterviews.find((event) => new Date(event.date) >= new Date()) || null;
};

export const getMonthMatrix = (referenceDate) => {
  const current = new Date(referenceDate);
  const firstOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  const start = new Date(firstOfMonth);
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);

  const matrix = [];
  let cursor = new Date(start);

  for (let week = 0; week < 6; week += 1) {
    const row = [];
    for (let day = 0; day < 7; day += 1) {
      row.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(row);
  }

  return matrix;
};

export const getWeekDays = (referenceDate) => {
  const current = new Date(referenceDate);
  const start = new Date(current);
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);

  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(start);
    value.setDate(start.getDate() + index);
    return value;
  });
};

export const getRangeForView = (view, referenceDate) => {
  if (view === "week") {
    const week = getWeekDays(referenceDate);
    return { startDate: week[0], endDate: week[6] };
  }

  const current = new Date(referenceDate);
  return {
    startDate: new Date(current.getFullYear(), current.getMonth(), 1),
    endDate: new Date(current.getFullYear(), current.getMonth() + 1, 0)
  };
};

const toICSDate = (date, time) => {
  const value = new Date(date);
  const [hours = "09", minutes = "00"] = String(time || "09:00").split(":");
  value.setHours(Number(hours), Number(minutes), 0, 0);

  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hour = pad(value.getHours());
  const minute = pad(value.getMinutes());
  const second = pad(value.getSeconds());

  return `${year}${month}${day}T${hour}${minute}${second}`;
};

export const buildICSFile = (events = []) => {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PlaceMentor369//Calendar//EN"];

  sortEvents(events).forEach((event) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event._id || `${event.title}-${event.date}`}`,
      `DTSTAMP:${toICSDate(new Date(), "00:00")}`,
      `DTSTART:${toICSDate(event.date, event.time)}`,
      `SUMMARY:${event.title} - ${event.company}`,
      `DESCRIPTION:${String(event.description || "").replace(/\n/g, " ")}`,
      `LOCATION:${String(event.location || "").replace(/\n/g, " ")}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

export const buildGoogleCalendarLink = (event) => {
  const start = toICSDate(event.date, event.time);
  const link = new URL("https://calendar.google.com/calendar/render");
  link.searchParams.set("action", "TEMPLATE");
  link.searchParams.set("text", `${event.title} - ${event.company}`);
  link.searchParams.set("dates", `${start}/${start}`);
  link.searchParams.set("details", event.description || "");
  link.searchParams.set("location", event.location || "");
  return link.toString();
};

export const formatEventDateTime = (event) => `${formatLongDate(event.date)} • ${formatTime(event.time)}`;