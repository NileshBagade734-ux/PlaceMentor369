import EventCard from "./EventCard";
import { getMonthMatrix, getReminderLabel } from "../../utils/calendarUtils.js";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MonthView = ({ referenceDate, groupedEvents, onOpenEvent, onCreateForDate }) => {
  const matrix = getMonthMatrix(referenceDate);
  const currentMonth = new Date(referenceDate).getMonth();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {dayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-7 md:divide-y-0 md:divide-x">
        {matrix.flat().map((date, index) => {
          const key = date.toISOString().slice(0, 10);
          const events = groupedEvents[key] || [];
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = key === new Date().toISOString().slice(0, 10);

          return (
            <div
              key={`${key}-${index}`}
              className={`group min-h-[180px] border-slate-100 p-3 text-left transition hover:bg-slate-50 md:border-b md:last:border-b-0 ${!isCurrentMonth ? "bg-slate-50/60 text-slate-400" : "bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-indigo-600 text-white" : "text-slate-700 group-hover:bg-slate-100"}`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {isCurrentMonth ? "" : "Next"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onCreateForDate(date)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  + Add
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {events.slice(0, 2).map((event) => (
                  <EventCard key={event._id} event={event} onClick={onOpenEvent} compact />
                ))}

                {events.length > 2 && (
                  <div className="text-xs font-medium text-indigo-600">
                    +{events.length - 2} more events
                  </div>
                )}

                {events.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onCreateForDate(date)}
                    className="w-full rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400 transition group-hover:border-indigo-200 group-hover:text-indigo-600"
                  >
                    Click to add an event
                  </button>
                )}
              </div>

              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {getReminderLabel({ date }) || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;