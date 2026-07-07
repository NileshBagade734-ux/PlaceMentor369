import { CalendarClock, ChevronRight, MapPin, TimerReset } from "lucide-react";
import {
  formatEventDateTime,
  getDaysUntil,
  getEventTypeMeta,
  getReminderLabel
} from "../../utils/calendarUtils.js";

const UpcomingEventsSidebar = ({ events, onQuickView }) => {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Upcoming</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Next 5 events</h3>
        </div>
        <CalendarClock className="h-5 w-5 text-slate-400" />
      </div>

      <div className="mt-5 space-y-3">
        {events.length > 0 ? events.map((event) => {
          const typeMeta = getEventTypeMeta(event.eventType);
          const daysLeft = getDaysUntil(event.date);

          return (
            <button
              key={event._id}
              type="button"
              onClick={() => onQuickView(event)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${typeMeta.accent} text-white`}>
                  <TimerReset className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{event.company}</p>
                      <p className="truncate text-sm text-slate-500">{event.title}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {daysLeft < 0 ? "Past" : `${daysLeft}d`}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{event.location || "No location set"}</span>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      {event.eventType} • {getReminderLabel(event) || "Upcoming"}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{formatEventDateTime(event)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                Quick view <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          );
        }) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <p className="font-semibold text-slate-700">No upcoming events</p>
            <p className="mt-1 text-sm text-slate-500">Add a placement reminder or interview slot to get started.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default UpcomingEventsSidebar;