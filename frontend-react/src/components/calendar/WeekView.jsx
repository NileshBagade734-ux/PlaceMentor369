import EventCard from "./EventCard";
import { formatLongDate, getWeekDays } from "../../utils/calendarUtils.js";

const WeekView = ({ referenceDate, groupedEvents, onOpenEvent, onCreateForDate }) => {
  const week = getWeekDays(referenceDate);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      {week.map((date) => {
        const key = date.toISOString().slice(0, 10);
        const events = groupedEvents[key] || [];
        const isToday = key === new Date().toISOString().slice(0, 10);

        return (
          <section key={key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${isToday ? "text-indigo-700" : "text-slate-900"}`}>{formatLongDate(date)}</p>
                <p className="text-xs text-slate-500">{events.length} event{events.length === 1 ? "" : "s"} scheduled</p>
              </div>
              <button
                type="button"
                onClick={() => onCreateForDate(date)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                Add event
              </button>
            </div>

            {events.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} onClick={onOpenEvent} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                No events for this day.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default WeekView;